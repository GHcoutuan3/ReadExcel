const express    = require('express');
const router     = express.Router();
const multer     = require('multer');
const xlstojson  = require("xls-to-json-lc");
const xlsxtojson = require("xlsx-to-json-lc");
const fs         = require('fs');

// Upload form - address: localhost:3000/upload
router.get('/', ensureAuth, function(req,res){
  res.render('upload', {
  title: 'Upload file'
  });
});

router.get('/display', ensureAuth, function(req, res, result){
    res.render('exceldata', {
      title: 'Excel data',
      result:result
    });
});

var storage = multer.diskStorage({ //multers disk storage settings
        destination: function (req, file, cb) {
            cb(null, './uploads')
        },
        filename: function (req, file, cb) {
            var datetimestamp = Date.now();
            cb(null, 'UL' + datetimestamp + '.' + file.originalname.split('.')[file.originalname.split('.').length -1])
        }
    });

var upload = multer({ //multer settings
                storage: storage,
                fileFilter : function(req, file, callback) { //file filter
                    if (['xls', 'xlsx'].indexOf(file.originalname.split('.')[file.originalname.split('.').length-1]) === -1) {
                        return callback(new Error('Wrong extension type'));
                    }
                    callback(null, true);
                }
            }).single('selectedfile');

//API path that will upload the files on submit
router.post('/', function(req, res) {
    var exceltojson;
    upload(req,res,function(err){
        if(err){
             res.json({error_code:1,err_desc:err});
             console.log('Something wrong');
             return;
        }
        if(!req.file){
            res.json({error_code:1,err_desc:"No file loaded"});
            console.log('No File available to read');
            return;
        }
        //---------------------------------------------------
        // Pass this to db
        //---------------------------------------------------
         var myfile = req.file;
         var originalname = myfile.originalname;
         var filename = myfile.filename;
         var path = myfile.path;
         var destination = myfile.destination;
         var size = myfile.size;
         var mimetype = myfile.mimetype;
         //res.send(myfile); return;
         //console.log('File Uploaded: '+originalname+size+mimetype);
         if(req.file.originalname.split('.')[req.file.originalname.split('.').length-1] === 'xlsx'){
                exceltojson = xlsxtojson;
            } else {
                exceltojson = xlstojson;
            }
            try {
                exceltojson({
                    input: req.file.path,
                    output: null, //since we don't need output.json
                    lowerCaseHeaders:true
                }, function(err,result){
                    if(err) {
                        return res.json({error_code:1,err_desc:err, data: null});
                    }
                    //res.json({error_code:0,err_desc:null, data: result});
                    //req.flash('success', 'File Uploaded');
                    // res.render('upload', {
                    //  title: 'Upload another file?'
                    // });
                     else {
                       // ------------------------------------------------------------------
                       // Need to display results in a table
                       // ------------------------------------------------------------------
                       //res.redirect('/upload/display');
                       console.log(result);

                       //res.json({error_code:0,err_desc:null, data: result});

                     }
                });
            } catch (e){
                res.json({error_code:1,err_desc:"Corupted excel file"});
            }
            // Delete the file from the server once data read in JSON
            try {
                fs.unlinkSync(req.file.path);
            } catch(e) {
                //error deleting the file
            }
    });
});

// Access control
function ensureAuth(req, res, next){
  if(req.isAuthenticated()){
    return next();
  } else {
    req.flash('danger','Please login');
    res.redirect('/users/login');
  }
}
module.exports = router;
