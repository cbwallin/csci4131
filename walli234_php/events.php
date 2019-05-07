<!-- unset($_SESSION['name']); // will delete just the name data
session_destroy(); // will delete ALL data associated with that user -->


<?php
    error_reporting(E_ALL);
    ini_set( 'display_errors','1');

    session_start();
    if (!isset($_SESSION['user']) || !isset($_SESSION['password'])) {
        header('Location: login.php');
        die();
    }

    if (isset($_GET['logout'])) {
        session_destroy();
        header('Location: login.php');
    }

    // global $db_servername;
    // global $db_username;
    // global $db_password;
    // global $db_name;
    // global $db_port;
    // // require('./database.php');
    // // include_once("./database.php");
    // include "database.php";
    $db_servername = "cse-curly.cse.umn.edu";
    $db_username = "C4131S19G117";
    $db_password = "13719";
    $db_name = "C4131S19G117";
    $db_port = 3306;

    if (isset($db_servername) && isset($db_username) && isset($db_password) && isset($db_name)) {
        $conn = new mysqli($db_servername, $db_username, $db_password, $db_name);

        if ($conn->connect_error) {
            $error .= $db_servername.'MYSQL ERROR: '.$conn->connect_error.'<br />';
        }  else {
            $sql_query = 'SELECT * FROM tbl_events;';
            if (!empty($_GET)) { // The user has submitted using the filter form.
                $column_name = trim($_GET['column_name']);
                $keyword = $_GET['keyword'] ? trim($_GET['keyword']) : '';
                if ($column_name != '' && $keyword != '') {
                    $sql_query = "SELECT * FROM tbl_events WHERE $column_name LIKE '%$keyword%';";
                }
            }
            echo $sql_query;
            $result = $conn->query($sql_query);
            $conn->close();
        }
    }


?>


<html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css">
        <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.1.1/jquery.min.js"></script>
        <script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js"></script>
    </head>
    <body>
      <nav class="navbar navbar-default">
          <div class="container-fluid">
              <ul class="nav navbar-nav">
                  <li><a href="login.php"><b>Events Page</b></a></li>
                  <li><a href="events.php?logout=true"><span class="glyphicon glyphicon-log-out"></span></a></li>
                  <?php
                    echo "<p id='userWelcome' style='right:50px; top:12px; position:absolute'>
                        Welcome ".$_SESSION['user']."
                    </p>";

                  ?>
              </ul>
          </div>
      </nav>
      <br><br>
      <div class="container">
          <table class="table" id="scheduleTable">
              <thead>
                  <tr>
                      <th scope="col">Event Name</th>
                      <th scope="col">Location</th>
                      <th scope="col">Day of Week</th>
                      <th scope="col">Start-Time</th>
                      <th scope="col">End-Time</th>
                  </tr>
              </thead>
              <tbody>
                  <?php
                      while ($row = $result->fetch_assoc()) {
                          echo "<tr>";
                          echo "<td>".$row["event_name"]."</td>";
                          echo "<td>".$row["event_location"]."</td>";
                          echo "<td>".$row["event_day"]."</td>";
                          echo "<td>".$row["event_start_time"]."</td>";
                          echo "<td>".$row["event_end_time"]."</td>";
                          echo "</tr>";
                      }

                  ?>
              </tbody>
          </table>
      </div>
      <div>
          <form method="get" class="filterform">
	        <div class="form-group">
	          <label for="place_id">Column Name:</label>
            <select id="place" placeholder="select column name" name="column_name">
                 <option value="event_name">Event Name</option>
                 <option value="event_location">Event Location</option>
                 <option value="event_day">Day of the Week</option>
                 <option value="event_start_time">Start Time</option>
                 <option value="event_end_time">End Time</option>
            </select>
	        </div>
	        <div class="form-group">
	          <label for="keyword">Contains:</label>
	          <input type="text" class="form-control" id="pname" placeholder="Enter keyword" name="keyword">
	        </div>
	        <input type="submit" class="btn btn-primary btn-block" id="submitLogin" value="Filter">
	      </form>
      </div>
    </body>
</html>
