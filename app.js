const express = require('express');
const ejs = require('ejs');
const ContactosModel = require('./models/contactos');
const fileUpload = require('express-fileupload');  // Modulo archivos
const session = require('express-session')

const app = express();
const PUERTO = 3000;

app.use(fileUpload()); //  Para subir archivos

app.set('view engine','ejs');

app.set("views",__dirname+'/vistas').renderFile;

app.use(express.static('public/js'));
app.use(express.static('public/css'));
app.use('/images',express.static(__dirname+'/images'))// Ruta donde se almacenaran las imagenes

app.use(session({
  secret: '12345678abcd',
  resave: true,
  saveUninitialized: true
}))


app.get('/', function (req, res){
    res.render('home');
});

app.get('/open_sesion', function (req, res){
  res.render('login');
});


app.get('/consulta',async (req, res) =>{
    if(!req.session.usuario){
       res.render('login')
    }else{
      usu = req.session.usuario;
    }

    const datos = await ContactosModel.consultar();
    res.render('consulta',{datos, usu})
});

app.post('/baja', (req, res)=>{
    var body=''
    req.on('data', async(data)=>{
        body+=data;
        var id = JSON.parse(body).id;
        const result = await ContactosModel.baja(id);
        res.end(JSON.stringify({ok_res: true}))

    });
});

//-----------------------------------------------------------
app.post('/datos', async (req, res)=>{
  console.log(req.files);

  const image = req.files.foto;
  const tiempo = Date.now();
  const path = __dirname+'/images/'+tiempo+image.name;

  const new_contacto = {
   nombre : req.body.nom,
   ap_pat : req.body.ap_pat,
   ap_mat : req.body.ap_mat,
   tel : req.body.telefono,
   email : req.body.e_mail,
   fnac : req.body.fnac,
   foto : tiempo+image.name,
  }

  //console.log(new_contacto);

  image.mv(path,(error)=>{
    if (error){ 
      console.log(error);
      return;
    }
  });
  
  const result = await ContactosModel.alta(new_contacto);
  res.end(JSON.stringify({ok_res: true}));
});
//-----------------------------------------------------------


//-----------------------------------------------------------
app.post('/login', async (req, res)=>{

   let usuario = req.body.usuario;
   let clave = req.body.clave;

  console.log(usuario);
  debugger

  const result = await ContactosModel.login(usuario, clave);

  //console.log(result);
  //& debugger

  if (result[0]){
    req.session.usuario=result[0].usuario
    res.end(JSON.stringify({ok_res: true}));    
  }else{
    res.render('login')
  }


});
//-----------------------------------------------------------

//-----------------------------------------------------------
app.get('/logout', (req, res) => {
  req.session.destroy(); 
  res.render('login');
})
//-----------------------------------------------------------



//-----------------------------------------------------------
app.post('/actualiza', async (req, res)=>{
  console.log(req.files);

  console.log('---------'+req.body.id+'-------')
  debugger

  if (req.files != null){
    var image = req.files.foto;    
    console.log('----------'+image.name+'------------')
    const tiempo = Date.now();
    var path = __dirname+'/images/'+tiempo+image.name;    
    var titulo_foto = tiempo+image.name;
  }else{
    console.log('no se envio foto')
    console.log(req.body.foto)
    var titulo_foto = req.body.foto;
  }

  id =  req.body.id;

  const new_contacto = {
   nombre : req.body.nom,
   ap_pat : req.body.ap_pat,
   ap_mat : req.body.ap_mat,
   tel : req.body.telefono,
   email : req.body.e_mail,
   fnac : req.body.fnac,
   foto : titulo_foto
  }

  //console.log(new_contacto);
  if (req.files != null){
    image.mv(path,(error)=>{
      if (error){ 
        console.log(error);
        return;
      }
    });
  }
  const result = await ContactosModel.modi(new_contacto, id);
  res.end(JSON.stringify({ok_res: true}));
});




app.listen(PUERTO, function(){
    console.log('Servidor en espera http://localhost');
})