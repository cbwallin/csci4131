#!/usr/bin/env python3
# See https://docs.python.org/3.2/library/socket.html
# for a decscription of python socket and its parameters


import socket

from threading import Thread
from argparse import ArgumentParser

MAX_PACKET = 32768


class EchoServer:
    def __init__(self, host, port):
        print('listening on port {}'.format(port))
        self.host = host
        self.port = port

        self.setup_socket()

        try:
            self.accept()
        except KeyboardInterrupt:
            print("You Interupted")
        self.sock.shutdown(1)
        self.sock.close()

    def setup_socket(self):
        self.sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        self.sock.bind((self.host, self.port))
        self.sock.listen(128)

    def accept(self):
        while True:
            (client, address) = self.sock.accept()
            th = Thread(target=client_talk, args=(client, address))
            th.start()


def handle_form(query_params, client_sock):
    form_data = query_params.split('&')

    # Create the table to be populated with form data
    response_body = [
        '''<html><head>
            <style>
                table {
                  font-family: arial, sans-serif;
                  border-collapse: collapse;
                  width: 100%;
                }

                td, th {
                  border: 1px solid #dddddd;
                  text-align: left;
                  padding: 8px;
                }

                tr:nth-child(even) {
                  background-color: #dddddd;
                }
            </style>
            </head>''',
        '<body><h1>Following Form Data Submitted Successfully</h1>',
        '<table style="width:500px">',
    ]

    for entry in form_data:
        k, v = entry.split('=')
        response_body.append('<tr><td>%s</td><td>%s</td></tr>' % (k, v))

    response_body.append('</table></body></html>')

    response_body_raw = ''.join(response_body)

    response_headers = {
    'Content-Length': len(response_body_raw),
    'Connection': 'keep-alive',
    }
    response_headers_raw = ''.join('%s: %s\n' % (k, v) for k, v in response_headers.items())

    response_proto = 'HTTP/1.1'
    response_status = '200'
    response_status_text = 'OK'

    head = '%s %s %s' % (response_proto, response_status, response_status_text) + '\n' + response_headers_raw + '\n'

    client_sock.sendall(head.encode("utf-8"))
    client_sock.sendall(response_body_raw.encode("utf-8"))

def get_accept_value(resp_list):
    line = list(filter(lambda x: x.startswith("Accept"), resp_list))[0]
    return line.split(": ")[1]

def client_talk(client_sock, client_addr):
    req = recv_all(client_sock)
    if (not req):
        # Handles empty requests
        client_sock.shutdown(1)
        client_sock.close()
        print('connection closed.')
        return

    response_items = req.split('\r\n')
    first_line = response_items[0].split(' ')
    method = first_line[0] # First string is a method
    requesting_file = first_line[1] #Second string is request file
    print("req:", req)

    if (requesting_file == '/favicon.ico'):
        # I don't know how else to deal with these / get rid of them
        client_sock.shutdown(1)
        client_sock.close()
        print('connection closed.')
        return

    if (method == "POST"):
        form_data = response_items[len(response_items)-1]
        handle_form(form_data, client_sock)


    elif (method == "HEAD"):
        response_headers = {
            'Content-Type': 'text/html; encoding=utf8',
            'Content-Length': str(len(rdata)),
            'Connection': 'keep-alive',
        }

        response_headers_raw = ''.join('%s: %s\n' % (k, v) for k, v in response_headers.items())

        response_proto = 'HTTP/1.1'
        response_status = '200'
        response_status_text = 'OK'

        head = '%s %s %s' % (response_proto, response_status, response_status_text) + '\n' + response_headers_raw + '\n'

        client_sock.sendall(head.encode("utf-8"))
    elif (method == "GET"):
        try:
            if (requesting_file.startswith("/?")):
                # The GET request is coming from a form
                query_params = requesting_file[2:] # Remove the '/?'
                handle_form(query_params, client_sock)
                # clean up
                client_sock.shutdown(1)
                client_sock.close()
                print('connection closed.')
            elif (requesting_file == "/mytube"):
                # Redirect
                response_headers = {
                    'Content-Type': 'text/html; encoding=utf8',
                    'Location': "https://www.youtube.com",
                    'Connection': 'keep-alive',
                }

                response_headers_raw = ''.join('%s: %s\n' % (k, v) for k, v in response_headers.items())

                response_proto = 'HTTP/1.1'
                response_status = '301'
                response_status_text = 'Permanently Moved'

                head = '%s %s %s' % (response_proto, response_status, response_status_text) + '\n' + response_headers_raw + '\n'
                print(head)
                client_sock.sendall(head.encode("utf-8"))
            else:
                # The GET request is seeking a file.
                path = '.' + requesting_file
                file = open(path,'rb') # open file , r => read , b => byte format
                rdata = file.read()
                file.close()

                if(requesting_file.endswith(".jpg")):
                    mimetype = 'image/jpg'
                elif(requesting_file.endswith(".css")):
                    mimetype = 'text/css'
                elif(requesting_file.endswith(".png")):
                    mimetype = 'text/png'
                elif(requesting_file.endswith(".html")):
                    mimetype = 'text/html'
                elif(requesting_file.endswith(".js")):
                    mimetype = 'text/js'
                elif(requesting_file.endswith(".mp3")):
                    mimetype = 'audio/mp3'

                accept = get_accept_value(response_items)
                print(accept)
                print(mimetype)
                if (accept.find(mimetype) == -1 and accept != "*/*"):
                    # The requested file is not an acceptable type

                    print("\n\nThe requested file is not an acceptable type\n")
                    send_response(client_sock, "text/html", "406", "File Doesn't Match Accepted Mimetype")
                else:
                    send_response(client_sock, mimetype, "200", "OK", rdata)


        except Exception as e:
            print("there was an error:", e)
            file = open("./404.html",'rb') # open file , r => read , b => byte format
            rdata = file.read()
            file.close()
            send_response(client_sock, "text/html", "404", "Not Found", rdata)

    else:
        print("They used a method other than GET, POST, or HEAD")
        send_response(client_sock, "text/html", "405", "Method Not Allowed")

    # Clean up
    client_sock.shutdown(1)
    client_sock.close()
    print('connection closed.')

def send_response(client_sock, mimetype, response_status, response_status_text, data=None):

    if (not data) :
        print("sending it without data")
        response_proto = 'HTTP/1.1'
        head = '%s %s %s' % (response_proto, response_status, response_status_text) + '\n\n'

        response = ['<html><body><center>',
            '<h3>Error : %s</h3>' % (response_status_text),
            '<p>Python HTTP Server</p></center></body></html>'
        ]
        response_body_raw = ''.join(response)

        client_sock.sendall(head.encode('utf-8'))
        client_sock.sendall(response_body_raw.encode('utf-8'))
        return

    response_headers = {
        'Content-Type': mimetype + '; encoding=utf8',
        'Content-Length': str(len(data)),
        'Connection': 'keep-alive',
    }

    response_headers_raw = ''.join('%s: %s\n' % (k, v) for k, v in response_headers.items())
    response_proto = 'HTTP/1.1'
    head = '%s %s %s' % (response_proto, response_status, response_status_text) + '\n' + response_headers_raw + '\n'

    client_sock.sendall(head.encode('utf-8'))
    client_sock.sendall(data)

def recv_all(sock):
    # Receive everything from `sock`, until timeout occurs, meaning sender
    # is exhausted, return result as string
    prev_timeout = sock.gettimeout()
    try:
        sock.settimeout(0.01)

        rdata = []
        while True:
            try:
                rdata.append(sock.recv(MAX_PACKET).decode("utf-8"))
            except socket.timeout:
                return ''.join(rdata)

        # unreachable
    finally:
        sock.settimeout(prev_timeout)


def parse_args():
    parser = ArgumentParser()
    parser.add_argument('--host', type=str, default='localhost',
                      help='specify a host to operate on (default: localhost)')
    parser.add_argument('-p', '--port', type=int, default=9001,
                      help='specify a port to operate on (default: 9001)')
    args = parser.parse_args()
    return (args.host, args.port)


if __name__ == '__main__':
    (host, port) = parse_args()
    EchoServer(host, port)
