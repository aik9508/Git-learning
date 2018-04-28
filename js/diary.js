// text color will be black if the date is in current month
// the date will be wrapped by a red circle if the date is today
function calendar_cell(cal_block,date,iscurrentmonth){
    const self = this;
    var today = new Date();
    self.cal_block = cal_block;
    self.calendar = cal_block.calendar;
    self.date=new Date(date.getTime());
    self.cell = $('<div class="calendar-cell">'+
                       '<div class="cell-date-container">'+
                            '<span class="cell-date"></span>'+
                            '<span class="cell-day">日</span>'+
                       '</div>'+
                       '<div class="cell-diary">'+
                       '</div>'+
                   '</div>');
    self.cell_date_container=$(self.cell.find("div.cell-date-container")[0]);
    self.cell_date=$(self.cell.find("span.cell-date")[0]);
    self.cell_diary=$(self.cell.find("div.cell-diary")[0]);
    if(iscurrentmonth){
        self.cell_date_container.addClass("emphasize-date");
    }
    self.cell_date.html(date.getDate());
    if(self.date.getFullYear() === today.getFullYear() &&
       self.date.getMonth() === today.getMonth() &&
       self.date.getDate() === today.getDate()){
       self.cell_date.addClass("cell-date-today");
    }
}

calendar_cell.prototype.addDiaryListener = function(){
    const self = this;
    self.cell.off();
    self.cell_diary.off();
    var mm = self.date.getMonth();
    var yy = self.date.getFullYear();
    var dd = self.date.getDate();
    var diarypath = yy+"/"+calendar.str_months_en[mm]+"/"+dd+".json";
    var opendiary = function(){
        $.ajax({
            url: diarypath,
            async: true,
            error: function(){
            },
            success: function(jsondiarydata){
                var diarydata = JSON.parse(jsondiarydata);
                var diarydate = diarydata.date;
                var content = diarydata.content;
                $(".diarycontent").html("");
                $(".diarycontent").append("<p class='text-center'>"+diarydate+"</p>");
                $(content).each(function(iter){
                    $(".diarycontent").append(
                            "<p>"+content[iter]+"</p>");
                });
                if(self.calendar.mode!=="mini"){
                    self.calendar.setMode("mini");
                }
                $("#mycalendar").addClass("mini");
                $("#diarywindow").show();
            }
        });
    };
    if(self.cal_block.mode!=="month"){
        console.log('ok');
        self.cell.click(opendiary);
    }else{
        self.cell_diary.click(opendiary);
    }
};

function calendar_block(cal, date){
    const self=this;
    self.calendar = cal;
    self.currentdate = new Date(date.getTime());
    // calendar cells
    self.cells=[];
    self.diarydates=[];
    self.block_wrapper = 
            $("<div class=calendar-block>"+
                "<div class='block-title'></div>"+
                "<ul class='weekdays'></ul>"+
                "<div class='month-block-mask'>"+
                    "<div class='month-block'></div>"+
                "</div>"+
              "</div>");
    if(self.calendar.mode){
        self.mode=self.calendar.mode;
    }else{
        self.mode="month";
    }
    self.block_title = $(self.block_wrapper.find(".block-title")[0]);
    var month_block_mask = $(self.block_wrapper.find(".month-block-mask")[0]);
    self.month_block = $(month_block_mask.find("div")[0]);
    for(var i=0; i<7; i++){
        $(self.block_wrapper.find(".weekdays")[0])
                                .append($("<li>"
                                +((self.mode==="month")?"周":"")
                                +calendar.str_days[i]
                                +"</li>"));
    }
}

calendar_block.prototype.init = function(){
    const self=this;
    self.block_title.html(self.mode==="year"?
                          calendar.str_months[self.currentdate.getMonth()]:
                          "");
    self.fillblock();            
};

// fill the calendar from a given date (6 lines)
calendar_block.prototype.fillblock = function(){
    const self=this;
    var date = self.currentdate;
    self.start_date = new Date(date.getFullYear(),date.getMonth(),1);
    // the index of the first day of this month in self.cells
    self.firstday = self.start_date.getDay(); 
    self.start_date.setDate(self.start_date.getDate()-self.firstday);
    var cdate = new Date(self.start_date.getTime());
    cdate.setDate(cdate.getDate()-1);
    self.month_block.html("");
    self.cells = [];
    for(var i=0;i<6;i++){
        var calendar_line = $("<div class='calendar-line'></div>");
        for (var j=0;j<7;j++){
            cdate.setDate(cdate.getDate()+1);
            var ccell = new calendar_cell(
                        self,
                        cdate,
                        cdate.getMonth() === date.getMonth());
            self.cells.push(ccell);
            calendar_line.append(ccell.cell);
        }
        self.month_block.append(calendar_line);
    }
    self.end_date = new Date(cdate.getTime());
    self.getDiaryDates();
};

calendar_block.prototype.goToNextMonth = function(){
    const self = this;
    var clines = self.month_block.find("div.calendar-line");
    if(clines.length===6){
        self.month_block.addClass("move-on");
        var nnewclines = (self.end_date.getDate()<=7)?5:4;
        self.start_date = new Date(self.end_date.getFullYear(),
                                   self.end_date.getMonth(),1);
        self.currentdate = new Date(self.start_date.getTime());
        // the index of the first day of this month in self.cells
        self.firstday = self.start_date.getDay(); 
        self.start_date.setDate(self.start_date.getDate()-self.firstday);
        var cdate = new Date(self.start_date.getTime());
        cdate.setDate(cdate.getDate()-1+(6-nnewclines)*7);
        for(var i=6-nnewclines;i<6;i++){
            var calendar_line = $("<div class='calendar-line'></div>");
                for (var j=0;j<7;j++){
                    cdate.setDate(cdate.getDate()+1);
                    var ccell = new calendar_cell(self,cdate);
                    self.cells.push(ccell);
                    calendar_line.append(ccell.cell);
            }
            self.month_block.append(calendar_line);
        }
        self.end_date=new Date(cdate.getTime());
        self.month_block.css(
                {"transform":"translate(0,-"
                 +nnewclines*self.month_block.parent('div').height()/6
                 +"px)"});
        window.setTimeout(function(){
            self.month_block.removeClass("move-on");
            self.month_block.css({"transform":"translate(0,0)"});
            self.month_block.find("div.calendar-line:lt("+nnewclines+")").remove();
            self.cells.splice(0,nnewclines*7);
            $(self.cells).each(function(){
                if($(this)[0].date.getMonth()===self.currentdate.getMonth()){
                    $(this)[0].cell_date_container.addClass("emphasize-date");
                }else{
                    $(this)[0].cell_date_container.removeClass("emphasize-date");
                }
            });
            self.getDiaryDates();
        },1000);
    }
};

calendar_block.prototype.goToPreviousMonth = function(){
    const self = this;
    var clines = self.month_block.find("div.calendar-line");
    if(clines.length===6){
        var tmp=new Date(self.start_date.getTime());
        tmp.setDate(tmp.getDate()-1);
        var tmp_cells=[];
        var nnewclines=(tmp.getDate()>28)?5:4;
        self.start_date = new Date(tmp.getFullYear(),tmp.getMonth(),1);
        self.currentdate= new Date(self.start_date.getTime());
        // the index of the first day of this month in self.cells
        self.firstday = self.start_date.getDay(); 
        self.start_date.setDate(self.start_date.getDate()-self.firstday);
        var cdate = new Date(self.start_date.getTime());
        cdate.setDate(cdate.getDate()-1);
        for(var i=0;i<nnewclines;i++){
            var calendar_line = $("<div class='calendar-line'></div>");
                for (var j=0;j<7;j++){
                    cdate.setDate(cdate.getDate()+1);
                    var ccell = new calendar_cell(self,cdate);
                    tmp_cells.push(ccell);
                    calendar_line.append(ccell.cell);
            }
            calendar_line.insertBefore(clines[0]);
            self.month_block.css(
                {"transform":"translate(0,-"
                 +(i+1)*self.month_block.parent('div').height()/6
                 +"px)"});
        }
        self.end_date=
                new Date(self.cells[(6-nnewclines)*7-1].date.getTime());
        window.setTimeout(function(){
                self.month_block.addClass("move-on");
                self.month_block.css({"transform":"translate(0,0)"});}
        ,100);
        window.setTimeout(function(){
            self.month_block.removeClass("move-on");
            self.month_block.find("div.calendar-line:gt(5)").remove();
            self.cells.splice((6-nnewclines)*7,nnewclines*7);
            self.cells=tmp_cells.concat(self.cells);
            $(self.cells).each(function(){
                if($(this)[0].date.getMonth()===self.currentdate.getMonth()){
                    $(this)[0].cell_date_container.addClass("emphasize-date");
                }else{
                    $(this)[0].cell_date_container.removeClass("emphasize-date");
                }
            });
            self.getDiaryDates();
        },1100);
    }
};

calendar_block.prototype.goToNextYear = function(){
    console.log('goToNextYear');
    const self = this;
    self.currentdate.setFullYear(self.currentdate.getFullYear()+1);
    self.fillblock();
};

calendar_block.prototype.goToPreviousYear = function(){
    const self = this;
    self.currentdate.setFullYear(self.currentdate.getFullYear()-1);
    self.fillblock();
};

// decides if it exists a diary written at a specific date.
calendar_block.prototype.getDiaryDates = function(){
    const self = this;
    var mm = self.currentdate.getMonth();
    var yy = self.currentdate.getFullYear();
    var filepath = yy+"/"+calendar.str_months_en[mm]+"/dates.json";
    $.ajax({
        url:filepath,
        async:true,
        error: function(){
            return;
        },
        success: function(jsondata)
        {
            var data=JSON.parse(jsondata);
            self.diarydates=data.dates;
            self.addDiaryListeners();
        }
    });
};

calendar_block.prototype.addDiaryListeners = function(){
    console.log('addDiaryListeners');
    const self = this;
    $(self.diarydates).each(function(dd){
        var ind = self.firstday+self.diarydates[dd]-1;
        if(self.mode!=="mini"){
            self.cells[ind]
                .cell_diary.html('<span class="cell-diary-link">日记</span>');
        }
        // Class hasdairy permits to distinguish the dates with diary 
        // with others in mini mode
        self.cells[ind].cell.addClass("hasdiary");
        self.cells[ind].addDiaryListener();
    });
};

function calendar(mode){
    const self = this;
    self.mode = (mode)?mode:"month";
    self.currentdate = new Date();
    self.calendar_wrapper = 
            $("<div class=calendar>"+
                "<div class=calendar-menu>"+
                    "<ul>"+
                        "<li class='mode-year'>年</li>"+
                        "<li class='mode-month'>月</li>"+
                        "<li class='mode-day'>日</li>"+
                    "</ul>"+
                "</div>"+
                "<div class='title'>"+
                    "<ul></ul>"+
                "</div>"+
                "<div class='calendar-blocks'></div>"+
              "</div>");
    self.menu = $(self.calendar_wrapper.find(".calendar-menu")[0]);
    self.btn_year = $(self.calendar_wrapper.find(".mode-year")[0]);
    self.btn_month = $(self.calendar_wrapper.find(".mode-month")[0]);
    self.btn_day = $(self.calendar_wrapper.find(".mode-day")[0]);
    if(self.mode === "month"){
        self.btn_month.addClass("active");
    }else if(self.mode === "year"){
        self.btn_year.addClass("active");
    }
    self.btn_month.click(function(){
        if(self.mode!=="month"){
            self.setMode("month");
        }
    });
    self.btn_year.click(function(){
        if(self.mode!=="year"){
            self.setMode("year");
        }
    });
    self.btn_next = $('<li class="next">&#10095;</li>');
    self.btn_prev = $('<li class="prev">&#10094;</li>');
    self.title = $('<li></li>'); // year and month
    $(self.calendar_wrapper.find(".title>ul")[0])
                           .append(self.btn_prev)
                           .append(self.btn_next)
                           .append(self.title);
    
    self.blocks_wrapper= $(self.calendar_wrapper.find(".calendar-blocks")[0]);
    self.setMode(self.mode);
}

Object.defineProperty(calendar,"str_months",{
    value: ["一月","二月","三月","四月","五月","六月","七月","八月","九月",
          "十月","十一月","十二月"],
    writable: false,
    enumerable: true,
    configurable: true
});

Object.defineProperty(calendar,"str_months_en",{
    value: ["january","feburary","march","april","may","june","july","august",
            "september","october","november","december"],
    writable: false,
    enumerable: true,
    configurable: true
});

Object.defineProperty(calendar,"str_days",{
    value: ["日", "一", "二", "三", "四", "五", "六"],
    writable: false,
    enumerable: true,
    configurable: true
});

calendar.prototype.setMode = function(mode){
    const self = this;
    self.mode = mode;
    self.title.html(self.currentdate.getFullYear()+"年"
                    + (self.mode==="year" ? "" :
                    calendar.str_months[self.currentdate.getMonth()]));
    self.calendar_wrapper.removeClass();
    self.calendar_wrapper.addClass(mode);
    self.calendar_wrapper.addClass("calendar");
    self.blocks = $([]);
    self.blocks_wrapper.html("");
    $(self.calendar_wrapper.find(".calendar-menu li")).each(function(){
        $(this).removeClass("active");
    });
    if(mode === "year"){
        self.calendar_wrapper.addClass("mini");
        self.btn_year.addClass("active");
        var yy = self.currentdate.getFullYear();
        for(var i=0; i<12; i++){
            var date = new Date(yy,i,1);
            var cblock = new calendar_block(self,date);
            cblock.init();
            self.blocks.push(cblock);
            self.blocks_wrapper.append(cblock.block_wrapper);
        }
    }else{
        if(mode === "month"){
            self.btn_month.addClass("active");
        }else{
            self.btn_day.addClass("active");
        }
        var cblock = new calendar_block(self,self.currentdate);
        cblock.init();
        self.blocks.push(cblock);
        self.blocks_wrapper.append(cblock.block_wrapper);
    }
    
    self.btn_next.off();
    self.btn_prev.off();
    if(self.mode !== "year"){
        self.btn_next.click(self.goToNextMonth.bind(self));
        self.btn_prev.click(self.goToPreviousMonth.bind(self));
    }else{
        self.btn_next.click(self.goToNextYear.bind(self));
        self.btn_prev.click(self.goToPreviousYear.bind(self));
    }
};

calendar.prototype.goToNextMonth = function(){
    const self = this;
    self.blocks[0].goToNextMonth.bind(self.blocks[0])();
    self.currentdate.setMonth(self.currentdate.getMonth()+1);
    self.title.html(self.currentdate.getFullYear()+"年"+
                           calendar.str_months[self.currentdate.getMonth()]);
};

calendar.prototype.goToPreviousMonth = function(){
    const self = this;
    self.blocks[0].goToPreviousMonth.bind(self.blocks[0])();
    self.currentdate.setMonth(self.currentdate.getMonth()-1);
    self.title.html(self.currentdate.getFullYear()+"年"+
                           calendar.str_months[self.currentdate.getMonth()]);
};

calendar.prototype.goToNextYear = function(){
    const self = this;
    self.blocks.each(function(){
        this.goToNextYear();
    });
    self.currentdate.setFullYear(self.currentdate.getFullYear()+1);
    self.title.html(self.currentdate.getFullYear()+"年");
};

calendar.prototype.goToPreviousYear = function(){
    const self = this;
    self.blocks.each(function(){
        this.goToPreviousYear();
    });
    self.currentdate.setFullYear(self.currentdate.getFullYear()-1);
    self.title.html(self.currentdate.getFullYear()+"年");
};

$(document).ready(function(){
    var mycalendar = new calendar();
    $("#mycalendar").append(mycalendar.calendar_wrapper);
});


