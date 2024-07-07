import multer from "multer";

/* const upload = multer({ dest: '../public' }); */

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "../public");
  },
  filename: function (req, file, cb) {
    cb(null, files.originalname); //multer doesnt provide the filetype in the name from its side.
  },
});

const upload = multer({ storage /* storage: storage */ });
