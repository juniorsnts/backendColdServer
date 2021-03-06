const http = require('http');
const formData = require('../models/tempo');
const espBD = require('../bdMysql/espBD');
function ligarCentral(id_central, modoForEsp, resp, request){
    const data = JSON.stringify({
        id: id_central,
        modo: modoForEsp
    });
    const options = {
        hostname: '192.168.43.115',
        port: 80,
        path: '/ligar',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': data.length
        }                        
    }
    const req = http.request(options, (res)=>{
        if(res.statusCode == 200){
            if(modoForEsp == 1){
                request.io.emit('status', true); //enviando via socket
                espBD.insertLog(id_central, formData('data'), formData('hora'), 'ligado');
                espBD.insertUltimoEstado(id_central, 'true', resp);
                console.log('Central '+id_central+ ' ligada as: '+formData('hora'));
                resp.json(modoForEsp);
            } else if(modoForEsp == 0){
                request.io.emit('status', false);
                espBD.insertLog(id_central, formData('data'), formData('hora'), 'desligado');
                espBD.insertUltimoEstado(id_central, 'false', resp);
                console.log('Central '+id_central+ ' desligada as: '+formData('hora'));
                resp.json(modoForEsp);
            }
        } else if(res.statusCode == 404){
            resp.json("error 404");
            console.log("Tentativa de acessar esp failed: "+res.statusCode);
        }
    });               
    req.on('error', (error)=>{
        console.error(error);
    });
    req.write(data);
    req.end();
}

module.exports = ligarCentral;