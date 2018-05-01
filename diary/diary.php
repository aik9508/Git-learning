<?php

/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
?>
<html>
    <head>
        <title>Home Page</title>
        <link rel="stylesheet" type="text/css" href="../css/personal.css">
        <link rel="stylesheet" type="text/css" href="../css/diary.css">
        <link rel="stylesheet" type="text/css" href="../css/calendar.css">
        <link href='../css/bootstrap.css' rel='stylesheet'>
        <script src="../js/jquery.js"></script>
        <script src="../js/bootstrap.js"></script>
        <script src="../js/diary.js"></script>
    </head>
    <body>
        <div class="container">
            <div class="row">
                <h1>Diary</h1>
                <nav class="navbar navbar-default">
                        <div class="container-fluid">
                            <div class="navbar-header">
                                <a class="navbar-brand" href="#">Aik</a>
                            </div>
                            <ul class="nav navbar-nav">
                                <li><a href="../index.php">Home</a></li>
                                <li class="active"><a href="#">Diary</a></li>
                                <li><a href="#">History</a></li>
                                <li><a href="#">Photos</a></li>
                            </ul>
                        </div>
                    </nav>
            </div>
        </div>
        <div class="big-wrapper">           
            <div class="container wrapper">
                <div class="row">
                    <div id="mycalendar">

                    </div>
                </div>
            </div>
        </div>
        <footer>
            <div>Last updated : April 21, 2018</div>
            <div>Author : Ke Wang</div>
        </footer>
    </body>
</html>
