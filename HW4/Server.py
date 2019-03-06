#!/usr/bin/env python3
# See https://docs.python.org/3.2/library/socket.html
# for a decscription of python socket and its parameters
import socket

from threading import Thread
from argparse import ArgumentParser

MAX_PACKET = 32768

def client_talk(client_sock, client_addr):
    print('talking to {}'.format(client_addr))
    # while True:
    #     data = client_sock.recv(MAX_PACKET)
    #     print(data.decode('utf-8'))
    #     if not data:
    #         break
    #     client_sock.sendall(data) # Sends the data it just got back to the socket.
    #     print(normalize_line_endings(data))

    req = recv_all(client_sock)
    string_list = req.split(' ')
    for x in string_list:
        print(x)
    method = string_list[0] # First string is a method
    requesting_file = string_list[1] #Second string is request file
    print(method)
    print(requesting_file)
    try:
        file = open(requesting_file,'rb') # open file , r => read , b => byte format
        rdata = file.read()
        file.close()

        header = 'HTTP/1.1 200 OK\n'

        if(requesting_file.endswith(".jpg")):
            mimetype = 'image/jpg'
        elif(requesting_file.endswith(".css")):
            mimetype = 'text/css'
        elif(requesting_file.endswith(".png")):
            mimetype = 'text/png'
        else:
            mimetype = 'text/html'

        header += 'Content-Type: '+str(mimetype)+'<strong>\n\n</strong>'

    except Exception as e:
        print("there was an error:", e)
        # header = 'HTTP/1.1 404 Not Found\n\n'
        # response = """<html>
        #     <body>
        #         <center>
        #         <h3>Error 404: File not found</h3>
        #         <p>Python HTTP Server</p>
        #         </center>
        #     </body>
        #     </html>""".encode('utf-8')
    # print(request)

    # clean up
    client_sock.shutdown(1)
    client_sock.close()
    print('connection closed.')

# def normalize_line_endings(s):
#     # r'''Convert string containing various line endings like \n, \r or \r\n,
#     # to uniform \n.'''
#
#     return ''.join((line + '\n') for line in s.splitlines())

def recv_all(sock):
    # r'''Receive everything from `sock`, until timeout occurs, meaning sender
    # is exhausted, return result as string.'''
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

class EchoServer:
    def __init__(self, host, port):
        print('listening on port {}'.format(port))
        self.host = host
        self.port = port

        self.setup_socket()

        self.accept()
        # self.sock.shutdown(1)
        self.sock.close()

    def setup_socket(self):
        self.sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        self.sock.bind((self.host, self.port))
        self.sock.listen(128)

    def accept(self):

        import time
        t_end = time.time() + 5
        while time.time() < t_end:
            (client, address) = self.sock.accept()
            th = Thread(target=client_talk, args=(client, address))
            th.start()

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
    print(port)
