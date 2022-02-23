const Paginate = function(req,res,next) {
 if(req.query.number){
     req.number =  req.query.number;
     next();
 }else{
     next();
 }
}

module.exports = {Paginate};