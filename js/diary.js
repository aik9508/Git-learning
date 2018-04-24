// text color will be black if the date is in current month
// the date will be wrapped by a red circle if the date is today
function calendar_cell(date,iscurrentmonth){
    const self = this;
    var today = new Date();
    self.date=new Date(date.getTime());
    self.cell = $('<li class="calendar-cell">'+
                       '<div class="cell-date-container">'+
                            '<span class="cell-date"></span>'+
                            '<span>日</span>'+
                       '</div>'+
                   '</li>');
    self.cell_date_container=$(self.cell.find("div")[0]);
    self.cell_date=$(self.cell.find("span.cell-date")[0]);
    if(iscurrentmonth){
        self.cell_date_container.addClass("emphasize-date");
    }
    self.cell_date.html(date.getDate());
    if(self.date.getFullYear() === today.getFullYear() &&
       self.date.getMonth() === today.getMonth() &&
       self.date.getDate() === today.getDate()){
       console.log('date' + date);
       console.log('today' + today);
       self.cell_date.addClass("cell-date-today");
    }
    if(self.date.getDay()===0){
        self.cell.addClass("left"); // add left border if this day is Sunday
    }
}

function calendar(){
    const self=this;
    // string constants
    var str_days = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];
    self.str_months = ["一月","二月","三月","四月","五月","六月","七月","八月","九月",
                     "十月","十一月","十二月"];
    // calendar cells
    self.cells=[];
    self.currentdate = new Date();
    self.start_date = new Date();
    self.end_date = new Date();
    self.calendar_wrapper = 
            $("<div>"+
                "<div class='month'>"+
                    "<ul></ul>"+
                "</div>"+
                "<ul class='weekdays'></ul>"+
                "<div class='calendar'>"+
                    "<div class='month-block'></div>"+
                "</div>"+
              "</div>");
    self.btn_next = $('<li class="next">&#10095;</li>');
    self.btn_prev = $('<li class="prev">&#10094;</li>');
    self.head = $('<li></li>'); // year and month
    self.body = $(self.calendar_wrapper.find(".calendar")[0]); // real calendar
    self.month_block = $(self.body.find("div")[0]);
    $(self.calendar_wrapper.find(".month>ul")[0])
                           .append(self.btn_prev)
                           .append(self.btn_next)
                           .append(self.head);
    for(var i=0; i<7; i++){
        $(self.calendar_wrapper.find(".weekdays")[0])
                               .append($("<li>"+str_days[i]+"</li>"));
    }
}

calendar.prototype.init = function(){
    const self=this;
    self.head.html(self.currentdate.getFullYear()+"年"+
                   self.str_months[self.currentdate.getMonth()]);
    self.fillcalendar();
    
    self.btn_next.click(function(){
        var clines = self.body.find("ul.calendar-line");
        if(clines.length===6){
            self.month_block.addClass("move-on");
            var nnewclines = (self.end_date.getDate()<=7)?5:4;
            self.start_date = new Date(self.end_date.getFullYear(),
                                       self.end_date.getMonth(),1);
            self.currentdate= new Date(self.start_date.getTime());
            self.start_date.setDate(self.start_date.getDate()-
                                    self.start_date.getDay());
            var cdate = new Date(self.start_date.getTime());
            cdate.setDate(cdate.getDate()-1+(6-nnewclines)*7);
            for(var i=6-nnewclines;i<6;i++){
                var calendar_line = $("<ul class='calendar-line'></ul>");
                    for (var j=0;j<7;j++){
                        cdate.setDate(cdate.getDate()+1);
                        var ccell = new calendar_cell(cdate);
                        self.cells.push(ccell);
                        calendar_line.append(ccell.cell);
                }
                self.month_block.append(calendar_line);
            }
            self.end_date=new Date(cdate.getTime());
            self.month_block.css(
                    {"transform":"translate(0,-"+nnewclines*100+"px)"});
            window.setTimeout(function(){
                self.month_block.removeClass("move-on");
                self.month_block.css({"transform":"translate(0,0)"});
                self.month_block.find("ul:lt("+nnewclines+")").remove();
                self.cells.splice(0,nnewclines*7);
                self.head.html(self.currentdate.getFullYear()+"年"+
                               self.str_months[self.currentdate.getMonth()]);
                $(self.cells).each(function(){
                    if($(this)[0].date.getMonth()===self.currentdate.getMonth()){
                        $(this)[0].cell_date_container.addClass("emphasize-date");
                    }else{
                        $(this)[0].cell_date_container.removeClass("emphasize-date");
                    }
                });
            },1000);
        }
    });
    
    self.btn_prev.click(function(){
        var clines = self.body.find("ul.calendar-line");
        if(clines.length===6){
            var tmp=new Date(self.start_date.getTime());
            tmp.setDate(tmp.getDate()-1);
            var tmp_cells=[];
            var nnewclines=(tmp.getDate()>28)?5:4;
            self.start_date = new Date(tmp.getFullYear(),tmp.getMonth(),1);
            self.currentdate= new Date(self.start_date.getTime());
            self.start_date.setDate(self.start_date.getDate()-
                                    self.start_date.getDay());
            var cdate = new Date(self.start_date.getTime());
            cdate.setDate(cdate.getDate()-1);
            for(var i=0;i<nnewclines;i++){
                var calendar_line = $("<ul class='calendar-line'></ul>");
                    for (var j=0;j<7;j++){
                        cdate.setDate(cdate.getDate()+1);
                        var ccell = new calendar_cell(cdate);
                        tmp_cells.push(ccell);
                        calendar_line.append(ccell.cell);
                }
                calendar_line.insertBefore(clines[0]);
                self.month_block.css(
                    {"transform":"translate(0,-"+(i+1)*100+"px)"});
            }
            self.end_date=
                    new Date(self.cells[(6-nnewclines)*7-1].date.getTime());
            window.setTimeout(function(){
                    self.month_block.addClass("move-on");
                    self.month_block.css({"transform":"translate(0,0)"});}
            ,100);
            window.setTimeout(function(){
                self.month_block.removeClass("move-on");
                self.month_block.find("ul:gt(5)").remove();
                self.cells.splice((6-nnewclines)*7,nnewclines*7);
                self.cells=tmp_cells.concat(self.cells);
                self.head.html(self.currentdate.getFullYear()+"年"+
                               self.str_months[self.currentdate.getMonth()]);
                $(self.cells).each(function(){
                    if($(this)[0].date.getMonth()===self.currentdate.getMonth()){
                        $(this)[0].cell_date_container.addClass("emphasize-date");
                    }else{
                        $(this)[0].cell_date_container.removeClass("emphasize-date");
                    }
                });
            },1100);
        }
    });
                 
};

// fill the calendar from a given date (6 lines)
calendar.prototype.fillcalendar = function(){
    const self=this;
    var date = self.currentdate;
    self.start_date = new Date(date.getFullYear(),date.getMonth(),1);
    self.start_date.setDate(self.start_date.getDate()-self.start_date.getDay());
    var cdate = new Date(self.start_date.getTime());
    cdate.setDate(cdate.getDate()-1);
    for(var i=0;i<6;i++){
        var calendar_line = $("<ul class='calendar-line'></ul>");
        for (var j=0;j<7;j++){
            cdate.setDate(cdate.getDate()+1);
            var ccell = new calendar_cell(
                        cdate,
                        cdate.getMonth() === date.getMonth());
            self.cells.push(ccell);
            calendar_line.append(ccell.cell);
        }
        self.month_block.append(calendar_line);
    }
    self.end_date = new Date(cdate.getTime());
};

$(document).ready(function(){
    var mycalendar = new calendar();
    $("#mycalendar").append(mycalendar.calendar_wrapper);
    mycalendar.init();
    console.log(mycalendar.start_date);
    console.log(mycalendar.end_date);
});


