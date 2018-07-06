var express = require('express');

var app = express();

var handlebars = require('express3-handlebars').create({defaultLayout:'main'});
app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');

app.set('port', process.env.PORT || 3000);

var fortunes = ['香葱','红烧','孜然','麻辣'];

app.use(express.static(__dirname + '/public'));

app.get('/',function(req, res){
    res.render('home');
});

app.get('/about',function(req, res){
    var randFotune = fortunes[Math.floor(Math.random() * fortunes.length)];
    res.render('about',{fortune:randFotune});
});

app.use(function(req, res){
    res.status(404);
    res.render('404');
    //res.send('404 - Not Found');
});

app.use(function(err, req, res, next){
    console.error(err.stack);
    //res.type('text/plain');
    res.status(500);
    res.render('500');
    //res.send('500 - Server Error');
});


app.listen(app.get('port'), function(){
    console.log('Express started on http://localhost:' + app.get('port') + '; press Ctl-C to terminate.');
});
