var fortunes = ['香葱','红烧','孜然','麻辣'];

exports.getFortune = function(){
    var index = Math.floor(Math.random() * fortunes.length);
    return fortunes[index];
};

