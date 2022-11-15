function createShiftArr(step) {
    var space = '    ';
    if (isNaN(parseInt(step))) {  // argument is string
        space = step;
    } else { // argument is integer
        switch (step) {
            case 1: space = ' '; break;
            case 2: space = '  '; break;
            case 3: space = '   '; break;
            case 4: space = '    '; break;
            case 5: space = '     '; break;
            case 6: space = '      '; break;
            case 7: space = '       '; break;
            case 8: space = '        '; break;
            case 9: space = '         '; break;
            case 10: space = '          '; break;
            case 11: space = '           '; break;
            case 12: space = '            '; break;
        }
    }

    var shift = ['\n']; // array of shifts
    for (var ix = 0; ix < 100; ix++) {
        shift.push(shift[ix] + space);
    }
    return shift;
}

//----------------------------------------------------------------------------
//匹配括号
function isSubquery(str, parenthesisLevel) { 
    return parenthesisLevel - (str.replace(/\(/g, '').length - str.replace(/\)/g, '').length)
}

function split_sql(str, tab) {
    return str.replace(/\s{1,}/g, " ")
        .replace(/ AND /ig, "~::~" + tab + tab + "AND ")
        .replace(/ BETWEEN /ig, "~::~" + tab + "BETWEEN ")
        .replace(/ CASE /ig, "~::~" + tab + "CASE ")
        .replace(/ ELSE /ig, "~::~" + tab + "ELSE ")
        .replace(/ END /ig, "~::~" + tab + "END ")
        .replace(/ FROM /ig, "~::~FROM ")
        .replace(/ GROUP\s{1,}BY/ig, "~::~GROUP BY ")
        .replace(/ HAVING /ig, "~::~HAVING ")
        //.replace(/ SET /ig," SET~::~")
        .replace(/ IN /ig, " IN ")
        .replace(/ JOIN /ig, "~::~JOIN ")
        .replace(/ CROSS~::~{1,}JOIN /ig, "~::~CROSS JOIN ")
        .replace(/ INNER~::~{1,}JOIN /ig, "~::~INNER JOIN ")
        .replace(/ LEFT~::~{1,}JOIN /ig, "~::~LEFT JOIN ")
        .replace(/ RIGHT~::~{1,}JOIN /ig, "~::~RIGHT JOIN ")
        .replace(/ ON /ig, "~::~" + tab + "ON ")
        .replace(/ OR /ig, "~::~" + tab + tab + "OR ")
        .replace(/ ORDER\s{1,}BY/ig, "~::~ORDER BY ")
        .replace(/ OVER /ig, "~::~" + tab + "OVER ")
        .replace(/\(\s{0,}SELECT /ig, "~::~(SELECT ")
        .replace(/\)\s{0,}SELECT /ig, ")~::~SELECT ")
        .replace(/ THEN /ig, " THEN~::~" + tab + "")
        .replace(/ UNION /ig, "~::~UNION~::~")
        .replace(/ USING /ig, "~::~USING ")
        .replace(/ WHEN /ig, "~::~" + tab + "WHEN ")
        .replace(/ WHERE /ig, "~::~WHERE ")
        .replace(/ WITH /ig, "~::~WITH ")
        //.replace(/\,\s{0,}\(/ig,",~::~( ")
        //.replace(/\,/ig,",~::~"+tab+tab+"")
        .replace(/ ALL /ig, " ALL ")
        .replace(/ AS /ig, " AS ")
        .replace(/ ASC /ig, " ASC ")
        .replace(/ DESC /ig, " DESC ")
        .replace(/ DISTINCT /ig, " DISTINCT ")
        .replace(/ EXISTS /ig, " EXISTS ")
        .replace(/ NOT /ig, " NOT ")
        .replace(/ NULL /ig, " NULL ")
        .replace(/ LIKE /ig, " LIKE ")
        .replace(/\s{0,}SELECT /ig, "SELECT ")
        .replace(/\s{0,}UPDATE /ig, "UPDATE ")
        .replace(/ SET /ig, " SET ")
        .replace(/~::~{1,}/g, "~::~")
        .split('~::~');
}

function formatSQLText (text, step=4) {
    var ar_by_quote = text.replace(/\s{1,}/g, " ")   //匹配任何空白字符，包括空格、制表符、换页符等等替换为单个空格
        .replace(/\'/ig, "~::~\'") //匹配单引号，添加分隔符号
        .split('~::~'),//分隔
        len = ar_by_quote.length,
        ar = [],
        deep = 0,
        tab = '    ',
        parenthesisLevel = 0,
        str = '',
        ix = 0,
        shift = createShiftArr(step);

    for (ix = 0; ix < len; ix++) {    //对字符串进行分割
        if (ix % 2) {
            ar = ar.concat(ar_by_quote[ix]);   
        } else {
            ar = ar.concat(split_sql(ar_by_quote[ix], tab));
        }
    }

    len = ar.length;
    for (ix = 0; ix < len; ix++) {
        parenthesisLevel = isSubquery(ar[ix], parenthesisLevel);
        if(/\s{0,}DECLARE\s{0,}/gi.exec(ar[ix])){
            ar[ix] = ar[ix].replace(/\s{0,}DECLARE\s{0,}/gi,'\n' + "DECLARE ").replace(/\s{0,}SELECT\s{0,}/g, "\n" + "SELECT" + " ")
        }
        if (/\s{0,}SELECT\s{0,}/.exec(ar[ix])) {
            ar[ix] = ar[ix].replace(/\,/g, ",\n" + tab + tab + "")
        }
        if (/\s{0,}SET\s{0,}/.exec(ar[ix])) {
            ar[ix] = ar[ix].replace(/\,/g, ",\n" + tab + tab + "")
        }
        if (/\s{0,}\(\s{0,}SELECT\s{0,}/.exec(ar[ix])) { //是否有嵌套
            deep++;
            str += shift[deep] + ar[ix];
        } else
            if (/\'/.exec(ar[ix])) {
                if (parenthesisLevel < 1 && deep) {
                    deep--;
                }
                str += ar[ix];  //不用添加换行符
            }
            else {
                str += shift[deep] + ar[ix];   //控制行的缩进
                if (parenthesisLevel < 1 && deep) {
                    deep--;
                }
            }
    }

    str = str.replace(/^\n{1,}/, '').replace(/\n{1,}/g, "\n");
    return str;
}



