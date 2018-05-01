<?php

/*save the modification of a diary*/

if (isset($_POST) and $_SERVER['REQUEST_METHOD'] == 'POST') {
    $diarypath = $_POST["diarypath"];
    $htmlcontent = $_POST["htmlcontent"];
    $file_to_write = fopen($diarypath.".diary","w");
    fwrite($file_to_write, $htmlcontent);
    fclose($file_to_write);
    if(isset($_POST["jsoncontent"])){
        $jsoncontent = $_POST["jsoncontent"];
        $file_to_write = fopen($diarypath.".json", "w");
        fwrite($file_to_write, $jsoncontent);
        fclose($file_to_write);
    }
}



