const {connect, sqlConfig} = require('./connect');
const request = sqlConfig.request();
const { EventEmitter } = require('events');
const res = require('express/lib/response');
const simpleEmitter = new EventEmitter();

const getNotes = async () => {
    var data;
    await connect().then(async () => {
        const result = await request.query('SELECT * FROM notes');
        data  = result;
    });
    return data;
}

const getRecievedNotes = async(user_id,limit_num) => {
    var data;
   await connect().then(async() => {
        request.input("user_id",user_id);
        request.input("number",Number(limit_num));
        var result = await request.query("SELECT TOP (@number) * FROM notes WHERE note_recipent = @user_id AND isDeleted=0 AND CreatedDate >= (SELECT  DATEADD(DAY, -30, GETDATE()))  ");
        data = result;
        
 })
 return data.recordset; 

} 

const insertNote = async ({title, body, note_type, urlPathes, owner, recipent}) => {
    var result;
    await connect().then(async() => {
        request.input("title", title);
        request.input("body", body);
        request.input("note_type", note_type);
        request.input("files", urlPathes); 
        request.input("owner", owner);
        request.input("recipent", recipent);
    
       result = await request.query(
        "INSERT INTO notes (title, body, files, note_type, note_owner, note_recipent) VALUES (@title, @body, @files, @note_type, @owner, @recipent)"
        );
   
  }).catch((e) => {console.log(e);;res.status(400).send(e)});
  if(!result){
    console.log("an error occured");
 }
 
 return result;
}

const addUser = async (username,profile_pic) => {
    var result;
 await connect().then(async() => {
    request.input("username", username);
    request.input("profilepicture", profile_pic);
     result = await request.query("INSERT INTO users (username, profilepicture) VALUES (@username, @profilepicture)");
     if(!result){
         console.log("An error occured");
     }
     console.log(result.rowsAffected[0]);
     return result;
 }).catch((e) => {
     console.log(e);
 });
}

const deletNote = async (note_id,user_id) => {
    var result;
   await connect().then(async() => {
        request.input("user_id",user_id);
        request.input("noteId",note_id);
         result = await request.query("UPDATE NOTES SET isDeleted = 1 WHERE id = @noteId AND note_recipent = @user_id ");
        if(!result){
           console.log("An error occured");
        }
       return result;
        
    })
}

const newestNote = async (id) => {
    var result;
    await connect().then(async() => {
         request.input("user_id",id);
          result = await request.query("SELECT * FROM notes WHERE id = (SELECT MAX(id) FROM notes WHERE note_recipent = @user_id ) ");
         if(!result){
            console.log("An error occured");
         }
          
     })
     const data = {title:result.recordset[0].title, recipent:result.recordset[0].note_recipent};
    return data;
    
         
}

const allNotesperUser = async(id) => {
    var result;
    await connect().then(async() => {
         request.input("id",id);
          result = await request.query("SELECT * FROM notes WHERE  note_recipent = @id  ");
         if(!result){
            console.log("An error occured");
         }   
     });
     var congrates_notes = result.recordset.filter(n => n.note_type === 2 );
     var initation_notes = result.recordset.filter(n => n.note_type === 1 );
     return {congrats:congrates_notes.length, invitation:initation_notes.length};
}

const activiateNotification = async (id) =>{
    var result;
    await connect().then(async() => {
         request.input("user_id",id);
          result = await request.query("UPDATE users SET  notification_activiated = 1 WHERE  id = @user_id  ");
         if(!result){
            console.log("An error occured");
         }   
         return result.rowsAffected[0];
     });
} 

const checkActiviation = async (id) => {
    var result;
    await connect().then(async() => {
         request.input("user_id",id);
          result = await request.query("SELECT * FROM users  WHERE  id = @user_id  ");
         if(!result){
            console.log("An error occured");
         }   
     });
     return result.recordset[0].notification_activiated;
}

module.exports = {getNotes,getRecievedNotes,insertNote,addUser, deletNote,newestNote, allNotesperUser, activiateNotification,checkActiviation};