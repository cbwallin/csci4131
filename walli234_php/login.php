<?php
  error_reporting(E_ALL);
  ini_set( 'display_errors','1');

  session_start();
  if (isset($_SESSION['user']) && ($_SESSION['password'])) {
    header('Location: events.php');
    die();
  }

  // include_once 'database.php';
  $db_servername = "cse-curly.cse.umn.edu";
  $db_username = "C4131S19G117";
  $db_password = "13719";
  $db_name = "C4131S19G117";
  $db_port = 3306;



  $login='';
  $error='';

  if (!empty($_POST)) { //check to make see if login form was submitted

    //validate the input...
    $login = trim($_POST['login']);
	$password = trim($_POST['password']);
    if (($login == '') or ($password == ''))
		$error .= 'Invalid Credentials.<br />';

    if ($error == '') {
      $conn = new mysqli($db_servername, $db_username, $db_password, $db_name);

      // Check connection
      if ($conn->connect_error) {
        $error .= $db_servername.'MYSQL ERROR: '.$conn->connect_error.'<br />';
      }  else {
        $sql_query = 'SELECT acc_id, acc_name, acc_login, acc_password FROM tbl_accounts WHERE acc_login=\''.$login.'\' LIMIT 1;';
        $result = $conn->query($sql_query);
        if ($result->num_rows == 1) {

            //Get the Password
            if ($row = $result->fetch_assoc()) {
                $hashed_password = $row['acc_password'];
                $error="";
                //hash the FORM password and compare with hashed password
				// stored in the DB
                if (base64_encode(hash("sha256",$password,True)) == ($hashed_password)) {
                  //everything is good, set the session variable and redirect the user
                  $_SESSION['user'] = $login;
				  $_SESSION['password'] = $hashed_password;

                  //close connection
                  $conn->close();

                  //redirect user
                  header('Location: events.php');
                  exit();
                } else {
                  $error .= 'Invalid Credentials';
                  header('Location: login.php');
                }
            } // end get password
        } // match found
		else {
            $error .= 'Invalid Credentials'; // no match found in db
            header('Location: login.php');
        }

        //close connection
        $conn->close();
      }// connection to database check
    } // form validation check
  }// $_POST check
?>

<!DOCTYPE HTML>
<html lang="en">


<head>
  <title>Log in</title>
  <meta charset="utf-8" />
  <link rel="stylesheet" type="text/css" href="./style.css" />
</head>

<body id="loginBody">
    <div>
        <h1>Login Page</h1>
        <p>Please enter your user name and password. Both are case sensitive.</p>
        <div>
          <form id="logInForm" name="logInForm" method="post">

            <label for="username">User: </label>
            <input type="text" id="username" name="login" placeholder="Enter user name" required>

            <label for="password">Password:</label>
            <input type="password" id="password" name="password" placeholder="Enter passwrod" required>


            <input type="submit" value="Login">
          </form>
        </div>
    </div>
</body>

</html>
