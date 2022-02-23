const {Paginate} = require('./Middleware/paginate');
const multer = require('multer');
const path = require('path');
const cron = require('node-cron');
var task = '';
var notes,paginatedNotes,newNote;
const {
    getNotes,
    getRecievedNotes,
    insertNote,
    addUser,
    deletNote,
    newestNote,
    allNotesperUser,
    activiateNotification,
    checkActiviation
} = require('./database/dboperations');


module.exports = function(io) { // catch here
    var express = require('express');
    var router  = express.Router();
    router.use(express.static('uploads'));
    // router.use(express.static(path.join(__dirname,'public')))

    const storage = multer.diskStorage({
        destination(req, file, cb){
            cb(null, 'uploads')
        },
        filename(req, file, cb){
            cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`)
        }
    });
    const upload = multer({
        storage:storage,
    });
    
    io.on('connection', (socket) => {
        console.log('A user is connected');
        socket.on('disconnect', () => {
            console.log('user disconnected');
          });  
           socket.emit("notes", notes);
           socket.emit("paginated_notes", paginatedNotes);
        //    socket.emit("newNote",newNote);
         
          
    });
    
// Getting All Notes in the database  
        router.get('/', async (req,res) => {
            const data = await getNotes();
            if(!data){
                res.status(400).send()
            }
            notes = data.recordset;
             res.status(200).sendFile(__dirname + '/public/index.html');
        });
// Getting All recieved Notes that is not softDeleted and with Paginate middleware for a particular user        
        router.get('/recievednotes/:userId',Paginate,async(req,res) => {
            var user_id = req.params.userId; 
            var limit_num = req.number;
            var data = await getRecievedNotes(user_id,limit_num);
                if(!data){
                    res.status(404).send();
                }
                paginatedNotes = data;
               res.status(200).sendFile(__dirname + '/public/index.html');
                // res.status(200).send(data);     
        })
// Adding a Note       
        router.post('/note',upload.array('photos',5),async (req,res) => {
        const {title, body, note_type, owner, recipent} = req.body;
        const files = req.files || null;
        var data = files.map(p => ({url:'localhost:3000/'+ path.basename(p.path)}));
        var urlPathes = data.map(e => e.url).join("|");
        var result = await insertNote({title, body, note_type, urlPathes, owner, recipent});
        //  if(result){
        //      newNote = {Note_Title:title, Note_Body:body, From: owner};
        //  }
        res.status(201).sendFile(__dirname + '/public/index.html');
        
        });  
 // Adding a User       
        router.post('/user',upload.single('photo'),async(req,res) => {
        const {username} = req.body;
        const file = req.file || null;
        const profile_pic = file? `localhost:3000/${path.basename(file.path)}` : null;
        const result = await addUser(username,profile_pic);
            res.status(201).send("New User Added");
        });
// Soft deleting a Note    
        router.put('/note/delete/:noteId',async(req,res) => {
        const {user_id} = req.body;
        var note_id = req.params.noteId;
        var result = await deletNote(note_id,user_id);
        res.status(200).send("note Deleted");
        });
// Latest Note for a particular user    
        router.get('/note/latest/:id',async (req,res) => {
            var recipentId = req.params.id;
            var data = await newNotes(recipentId);
            res.send(data);
            
        });
// Activiating notification for daily latest notes       
        router.put('/scheduleLastesNotes/:id',async (req,res) => {
            const result = await activiateNotification(req.params.id);
            if(result > 0){
                res.status(200).send("activated");
            }else{
                res.status(400).send();
            }
            
            
        });
// User Profile and getting daily latest notes after 1 minute (required 24 hours => I am aware of that)
        router.get('/user/:id', async (req,res) => {
            var id = req.params.id;
        const scheudeleActivated = await checkActiviation(id);
        console.log(scheudeleActivated);
        if(scheudeleActivated){
            console.log(id);
            const data =  await allNotesperUser(id);
            cron.schedule('*/1 * * * *', () => {
            console.log(`you have ${data.congrats} congrats notes and ${data.invitation} invitation notes`);
            },{
                scheduled: true
            });
        }
            
            res.send("Welcome")
        })
 
    return router;
    }