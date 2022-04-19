const mysql2 = require("mysql2/promise");
const express = require("express");
const app = express();
//funcion que procesa datos antes de que el servidor lo reciba
const morgan = require("morgan");
// puerto en el que escucha
app.set("port", process.env.PORT || 3030);
app.set("json spaces", 2);

//seguridad
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method"
  );
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, DELETE");
  res.header("Allow", "GET, POST, OPTIONS, PUT, DELETE");
  next();
});

app.use(morgan("dev"));
//--------------extra
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb" }));

//----------Credenciales DB
const db_credenciales = require("./credenciales");
var connProme = mysql2.createPool(db_credenciales);


//-------------Prueba conexion------------
app.post("/api/Todos", async function (req, res) {
  try {
    //verificar si existe el usuario
    let query = "Select * from usuario";
    let [rows, fields] = await connProme.query(query);
    return res.send({
      status: 200,
      msg: "Listado de usuarios",
      user: rows,
    });
  } catch (error) {
    console.log(error);
    return res.send({
      status: 500,
      msg: "Ocurrio error en el server",
    });
  }
});


//-------------Registro------------
app.post("/api/Registro", async function (req, res) {
  const { nombre } = req.body;
  const { pass } = req.body;
  try {
    //verificar si existe el usuario
    let query = "Select * from usuario where nombre=?";
    let [rows, fields] = await connProme.query(query, user);
    if (rows.length == 0) {
      //-----------------------------registrar en la base de datos
      //usuario
      query =
        "INSERT INTO usuario (nombre,pass) VALUES (?,?);";
      [rows, fields] = await connProme.execute(query, [
        nombre,
        pass,
      ]);

      //-----retornar al cliente
      query = "Select * from usuario where nombre=?";
      [rows, fields] = await connProme.execute(query, [user]);

      return res.send({
        status: 200,
        msg: "Usuario Registrado con exito",
        user: rows[0],
      });
    } else {
      return res.send({
        status: 400,
        msg: "El usuario ya existe, intenta con otro User Name",
      });
    }
  } catch (error) {
    console.log(error);
    return res.send({
      status: 500,
      msg: "Ocurrio error en el server",
    });
  }
});


//iniciando servidor
app.listen(app.get("port"), () => {
  console.log(`http://localhost:${app.get("port")}`);
});
