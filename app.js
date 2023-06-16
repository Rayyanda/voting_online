const express = require("express");
const mysql = require("mysql");
const session = require('express-session');
const bcrypt = require('bcrypt');
const app = express()
const moment = require("moment");
const multer = require("multer");
const sharp = require("sharp");
const path = require("path");
const port = process.env.port || 3000;

app.use(express.static('public'));
app.use(express.urlencoded({extended:false}));

const now = new Date();
const jam = now.getHours();
const menit = now.getMinutes();
const day = now.getDate();
const month = now.getMonth();
const year = now.getFullYear();
const today = `${year}-${month+1}-${day}`;
var salam = ""
if(jam <= 11){
    salam = "Selamat Pagi";
}else if(jam >= 11 && jam <= 18){
    salam = "Selamat Siang";
}else if(jam >= 18 && jam <= 24){
    salam = "Selamat Malam";
}


const connection = mysql.createConnection(
    {
        host : 'localhost',
        user: 'root',
        password : 'satu2tiga4_',
        database : 'voting_online'
        
    }
);
app.use(
    session({
      secret: 'my_secret_key',
      resave: false,
      saveUninitialized: false,
    })
  );
connection.connect((err)=>{
    if (err){
      console.log('Error Connecting : '+ err.stack);
      return;
    }
    console.log('Succes');
});


app.use((req, res, next) => {
    if (req.session.username === undefined) {
      res.locals.username = 'Guest';
      res.locals.salam = salam
      res.locals.isLoggedIn = false;
    } else {
      res.locals.salam = salam;
      res.locals.username = req.session.username;
      //res.locals.timeNow = displaytime()
      res.locals.isLoggedIn = true;
      res.locals.asSignIn = req.session.asSignIn;
    }
    next();
});
app.get('/', (req, res)=>{
    //res.sendFile(__dirname+'/views/homepage.ejs');
    res.render('homepage.ejs',{currentTime : moment().format('YYYY-MM-DD HH:mm:ss')});
});
app.get('/login', (req, res)=>{
    res.render('login.ejs',{errors : []});
});

app.post('/log-in',(req, res)=>{
    const kode_creator = req.body.kodeCreator;
    const password = req.body.passwordCreator;

    const errors = [];
    connection.query(
        'SELECT * FROM creator WHERE kode_creator = ?',
        [kode_creator],
        (error, results)=>{
            if(results.length > 0){
                const pass = results[0].password;
                console.log(pass);
                bcrypt.compare(password, pass,(error, isEqual)=>{
                    if(isEqual){
                        req.session.kodeCreator = results[0].kode_creator;
                        req.session.username = results[0].nama_creator;
                        req.session.asSignIn = "kreator";
                        console.log(today, req.session.kodeCreator);
                        res.redirect('/');
                    }else{
                        errors.push("password atau kode tidak sesuai");
                        res.render('login.ejs',{errors : errors});
                    }
                });
            }else{
                errors.push("Data tidak ditemukan");
                res.render('login.ejs',{errors : errors});
            }
        }
    )
});
app.get('/sign-up',(req, res)=>{
    res.render("daftar.ejs", {errors : []});
});

app.post('/start-sign-up', 
    (req, res, next)=>{
        console.log("pemeriksaan nilai input kosong");
        const kode_unik = req.body.kodeUnik;
        const password = req.body.passwordDaftar;
        const user = req.body.userName;
        const signas = req.body.gridRadios
        const kodeVote = req.body.kodevoting;
        const errors = [];
    if(kode_unik === ''){
        errors.push("Kode Unik Kosong");
    }
    if(password === ""){
        errors.push("Kata sandi kosong");
    }
    if(errors.length > 0){
        res.render('daftar.ejs',{errors : errors});
    }else{
        next()
    }
},
    (req, res, next)=>{
        console.log("pemeriksaan kode duplikat");
        const kode_unik = req.body.kodeUnik;
        const signas = req.body.gridRadios;
        const errors = [];
        if(signas === "kreator"){
            connection.query(
                'SELECT * FROM creator WHERE kode_creator = ?',
                [kode_unik],
                (error, results)=>{
                    if(results.length > 0){
                        errors.push("Kode kreator telah terdaftar");
                        res.render('daftar.ejs', {errors : errors});
                    }else{
                        next();
                    }
                }
            )
        }
        else if(signas === "peserta"){
            connection.query(
                'SELECT * FROM peserta_vote WHERE kode_peserta = ?',
                [kode_unik],
                (error, resutls)=>{
                    if(resutls.length > 0){
                        errors.push("Kode peserta telah terdaftar");
                        res.render('daftar.ejs',{errors : errors});
                    }else{
                        next()
                    }
                }
            )
        }
    },
    (req, res,next)=>{
        console.log("pendaftaran");
        const kode_unik = req.body.kodeUnik;
        const user = req.body.userName;
        const signas = req.body.gridRadios
        const kodeVote = req.body.kodevoting;
        const errors = [];
        const password = bcrypt.hashSync(req.body.passwordDaftar,10,(err, hash)=>{
            console.log(hash);
            return password;
        });
        if(signas === "kreator"){
            connection.query(
                'INSERT INTO creator(kode_creator, password, nama_creator) VALUES (?, ?, ?)',
                [kode_unik,password,user],
                (error, results)=>{
                    errors.push('Anda berhasil mendaftar, silahkan <span><a href="/login">Login</a></span>');
                    res.render('daftar.ejs',{errors : errors});
                }
            )
        }else if(signas === "peserta"){
            if(kodeVote === ''){
                errors.push("kode voting kosong");
                res.render('daftar.ejs',{errors : errors});
            }else{
                connection.query(
                    'INSERT INTO peserta_vote (kode_peserta, nama_peserta, kode_voting) VALUES (?, ?, ?)',
                    [kode_unik,user,kodeVote],
                    (error, results)=>{
                        next()
                    }
                )
            }
        }
    },
    (req, res)=>{
        const kode_unik = req.body.kodeUnik;
        console.log(kode_unik);
        const user = req.body.userName;
        const signas = req.body.gridRadios
        const kodeVote = req.body.kodevoting;
        const errors = [];
        const password = bcrypt.hashSync(req.body.passwordDaftar,10,(err, hash)=>{
            console.log(hash);
            return password;
        });
        connection.query(
            'SELECT * FROM peserta_vote WHERE kode_peserta = ?',
            [kode_unik],
            (error, results)=>{
                if(results.length > 0){
                    errors.push('Anda berhasil mendaftar sebagai peserta,\n silahkan lakukan voting sesuai jadwal');
                    res.render('daftar.ejs',{errors : errors});
                }else{
                    errors.push('Anda belum terdaftar, mungkin kesalahan kode voting');
                    res.render('daftar.ejs', {errors:errors});
                }
            }
        )
    }
);

app.get('/my-vote',(req, res)=>{
    const kode_creator = req.session.kodeCreator;
    console.log(kode_creator);
    const jml_psrta = [];
    connection.query(
        'SELECT * FROM voting WHERE kode_creator = ?',
        [kode_creator],
        (error, results)=>{
            if(results.length > 0){
                
                // connection.query(
                //     'SELECT kode_voting, COUNT(kode_peserta) AS "total" FROM peserta_vote GROUP BY kode_voting',
                //     (error, result)=>{
                //         jml_psrta.push(result);
                //     }
                //     )
                    res.render('myvote.ejs',{myvote:results});
            }
        }
    )
});




app.get('/manage/:manage_vote',(req, res, next)=>{
    const nama_vote = req.params.manage_vote;
    connection.query(
        'SELECT * FROM voting WHERE nama_voting = ?',
        [nama_vote],
        (error, results)=>{
            req.session.kode_vote = results[0].kode_voting;
            req.session.nama_vote = results[0].nama_voting;
            req.session.status_vote = results[0].status;
            next()
        }
    )
},
    (req, res)=>{
        const kode_vote = req.session.kode_vote;
        const datasesi = [];

        connection.query(
            'SELECT * FROM peserta_vote WHERE kode_voting = ?',
            [kode_vote],
            (error, results)=>{
                datasesi.push(req.session.kode_vote);
                datasesi.push(req.session.nama_vote);
                datasesi.push(req.session.status_vote);
                connection.query(
                    'SELECT * FROM kandidat_voting WHERE kode_voting = ?',
                    [kode_vote],
                    (error, results2)=>{
                        
                        res.render('manage_vote.ejs',{vote : results, data : datasesi, kandidat : results2});
                    }
                )
                
            } 
        );
    }
);

app.get('/result/:kode_vote',(req, res, next)=>{
    const kode_vote = req.params.kode_vote;
    connection.query(
        "SELECT COUNT(suara_vote) from peserta_vote WHERE kode_voting = ?",
        [kode_vote],
        (error, result1)=>{
            if(result1.length > 0){
                connection.query(
                    'SELECT kandidat_voting.nama_kandidat, kandidat_voting.foto_kandidat,peserta_vote.suara_vote, COUNT(kandidat_voting.kode_kandidat) AS "Total Suara", COUNT(kandidat_voting.kode_kandidat)*100 / (SELECT COUNT(peserta_vote.kode_peserta) FROM peserta_vote WHERE peserta_vote.kode_voting = ?) AS "Persentase " FROM peserta_vote, kandidat_voting WHERE kandidat_voting.kode_kandidat = peserta_vote.suara_vote AND kandidat_voting.kode_voting = ? GROUP BY kandidat_voting.kode_kandidat, kandidat_voting.nama_kandidat, kandidat_voting.foto_kandidat,peserta_vote.suara_vote ORDER BY COUNT(kandidat_voting.kode_kandidat)*100 / (SELECT COUNT(peserta_vote.kode_peserta) FROM peserta_vote WHERE peserta_vote.kode_voting = ?)DESC',
                    [kode_vote,kode_vote,kode_vote],
                    (error, results)=>{
                        console.log('total suara :' , result1[0]['COUNT(suara_vote)']);
                        console.log(results);
                        res.render('load_count_vote.ejs', {result : results, jml_suara : result1});
                    }
                )
            }
        }
    )
    
});



app.get('/create-vote',(req, res)=>{
    res.render('create_vote.ejs',{error : []});
});
app.post('/create-new-vote', (req, res, next)=>{
    const kodeCreator = req.session.kodeCreator;
    const kodeVote = req.body.kodeUnik;
    const namaVote = req.body.namaVote;
    connection.query(
        'INSERT INTO voting (kode_creator, kode_voting, nama_voting, status) VALUES (?, ?, ?, ?)',
        [kodeCreator,kodeVote,namaVote,0],
        (error, results)=>{
            next()
        }
    )
},
    (req, res)=>{
        const kode_vote = req.body.kodeUnik;
        connection.query(
            'SELECT * FROM voting WHERE kode_voting = ?',
            [kode_vote],
            (error, results)=>{
                if(results.length > 0){
                    res.redirect('/my-vote');
                }
            }
        )
    }

);

app.post('/add-participants-by-user',(req, res, next)=>{
    const kode_peserta = req.body.kodePeserta;
    const nama_peserta = req.body.namaPeserta;
    connection.query(
        'INSERT INTO peserta_vote (kode_peserta, nama_peserta, kode_voting) VALUES (?, ?, ?)',
        [kode_peserta,nama_peserta,req.session.kode_vote],
        (error, results)=>{
            next();
        }
    )
},
    (req, res)=>{
        const kode_peserta = req.body.kodePeserta;
        const nama_peserta = req.body.namaPeserta;
        const errors =[];
        connection.query(
            'SELECT * FROM peserta_vote WHERE kode_peserta = ?',
            [kode_peserta],
            (error, results)=>{
                if(results.length > 0){
                    if(results[0].nama_peserta === nama_peserta){
                        res.redirect(`/manage/${req.session.nama_vote}`);
                    }else{
                        res.redirect('/errors');
                    }
                    
                }
            }
        )
    }
);
app.get('/errors', (req, res)=>{
    res.render('error.ejs');
});

app.get('/open-vote',(req, res)=>{
    const kode_vote = req.session.kode_vote;
    console.log(kode_vote);
    connection.query(
        'UPDATE voting SET status = 1 WHERE kode_voting = ?',
        [kode_vote],
        (error, result)=>{
            res.redirect(`/manage/${req.session.nama_vote}`);
        }
    )
});
app.get('/stop-vote', (req, res)=>{
    const kode_vote = req.session.kode_vote;
    connection.query(
        'UPDATE voting SET status = 2 WHERE kode_voting = ?',
        [kode_vote],
        (error, result)=>{
            res.redirect(`/manage/${req.session.nama_vote}`);
        }
    )
});



app.get('/log-participants', (req, res)=>{

    res.render('tes.ejs');
});

app.get('/lupa-password', (req, res)=>{
    
});
app.post('/peserta', (req, res)=>{
    const kode_peserta = req.body.kodePeserta;
    connection.query(
        'SELECT * FROM peserta_vote WHERE kode_peserta = ?',
        [kode_peserta],
        (error, results)=>{
            if(results.length > 0){
                req.session.kd_vote_psrta = results[0].kode_voting;
                req.session.username = results[0].nama_peserta;
                req.session.kodeCreator = results[0].kode_peserta;
                const id = 'peserta';
                req.session.asSignIn = id;
                res.redirect('/');

            }else{
                res.redirect('/errors');
            }
        }
    )

});

const storage = multer.diskStorage({
    destination: function(req, file, cb){
        cb(null, 'public/image/kandidat/');
    },
    filename: function(req, file, cb){
        cb(null, file.originalname);
    }
});
const upload = multer({storage : storage});

app.post('/add-candidate', upload.single('fotoKandidat'), (req, res, next)=>{
    const filename = req.file.filename;
    const filepath = req.file.path;
    const height = 200;
    const width= 200;
    sharp(filepath)
        .resize(width,height)
    const kode_kandidat = req.body.kodeKandidat;
    const nama_kandidat = req.body.namaKandidat;
    const kode_vote = req.session.kode_vote;
    console.log(filename,nama_kandidat,kode_kandidat,kode_vote);
    connection.query(
        'INSERT INTO kandidat_voting (kode_kandidat, kode_voting, nama_kandidat, foto_kandidat) VALUES (?, ?, ?, ?)',
        [kode_kandidat,kode_vote,nama_kandidat,filename],
        (error, results)=>{
            next()
        }
    )
},
    (req, res)=>{
   
    const kode_kandidat = req.body.kodeKandidat;
    const nama_kandidat = req.body.namaKandidat;
    connection.query(
        'SELECT * FROM kandidat_voting WHERE kode_kandidat = ?',
        [kode_kandidat],
        (error, results)=>{
            if(results.length > 0){
                if(results[0].nama_kandidat === nama_kandidat){
                    res.redirect(`/manage/${req.session.nama_vote}`);
                }else{
                    res.redirect('/errors');
                }
            }
        }
    )
    }

);

app.get('/del-vote/:kode_vote', (req, res)=>{
    const kode_vote = req.params.kode_vote;
    connection.query(
        'DELETE FROM peserta_vote WHERE kode_voting = ?',
        [kode_vote],
        (error, result)=>{
            console.log('berhasil menghapus peserta');
            connection.query(
                'DELETE FROM kandidat_voting WHERE kode_voting = ?',
                [kode_vote],
                (error, results)=>{
                    console.log('berhasil menghapus kandidat');
                    connection.query(
                        'DELETE FROM voting WHERE kode_voting = ?',
                        [kode_vote],
                        (error, results2)=>{
                            res.redirect('/my-vote');
                        }
                    )
                }
            )
        }
    )
});

app.get('/history-vote', (req, res)=>{
    const kode_peserta = req.session.kodeCreator;
    const kode_vote = req.session.kd_vote_psrta;
    connection.query(
        'SELECT * FROM voting WHERE kode_voting = ?',
        [kode_vote],
        (error, results)=>{
            if(results.length > 0){
                connection.query(
                    'SELECT suara_vote FROM peserta_vote WHERE kode_peserta = ?',
                    [kode_peserta],
                    (error, results2)=>{
                        if(results2.length > 0){
                            console.log(kode_peserta, results2[0].suara_vote);
                            res.render('peserta.ejs', {vote_peserta : results, peserta : kode_peserta, data_peserta : results2});
                        }
                    }
                )
            }
        }
    );
});


app.get('/vote/:kode_peserta/:kode_voting', (req, res)=>{
    const kode_peserta = req.params.kode_peserta;
    const kode_voting = req.params.kode_voting;

    const dataSesi = [];
    connection.query(
        'SELECT * FROM voting WHERE kode_voting = ?',
        [kode_voting],
        (error, result_1)=>{
            dataSesi.push(result_1[0].nama_voting);
                connection.query(
                    'SELECT * FROM kandidat_voting WHERE kode_voting = ?',
                    [kode_voting],
                    (error, result)=>{
                        dataSesi.push(kode_peserta);
                        dataSesi.push(kode_voting);
                        
                        res.render('voting.ejs', {kandidat : result, datap : dataSesi});
                    }
                )
        }
    )
});

app.get('/vote-:kode_kandidat-:kode_peserta', (req, res)=>{
    const kode_kandidat = req.params.kode_kandidat;
    const kode_peserta = req.params.kode_peserta;
    connection.query(
        'UPDATE peserta_vote SET suara_vote = ? WHERE kode_peserta = ?',
        [kode_kandidat, kode_peserta],
        (error, result)=>{
            res.redirect('/history-vote');
        }
    );
});



app.post('/upload', upload.single('file'), (req, res)=>{
    const {filename} = req.file;
    res.redirect('/');
})

app.get('/delete-kandidat/:kode_kandidat', (req, res)=>{
    console.log('masuk ke route')
    const kode_kandidat = req.params.kode_kandidat;
    connection.query(
        "UPDATE peserta_vote SET suara_vote = '' WHERE suara_vote = ?"
        [kode_kandidat],
        (error, result)=>{
            console.log(result);
            console.log('Berhasil update data peserta');
            connection.query(
                'DELETE FROM kandidat_voting WHERE kode_kandidat = ?',
                [kode_kandidat],
                (eror, result2)=>{
                    console.log(eror, result2);
                    console.log('berhasil hapus kandidat')
                    res.redirect(`/manage/${req.session.nama_vote}`);
                }
            )
        }
    )
});

app.get('/delete/:kode_psrta',(req, res)=>{
    const kode_peserta = req.params.kode_psrta;
    console.log(kode_peserta);
    connection.query(
        'DELETE FROM peserta_vote WHERE kode_peserta = ?',
        [kode_peserta],
        (error, results)=>{
            res.redirect(`/manage/${req.session.nama_vote}`);
        }
    );
});




app.get('/logout', (req, res)=>{
    req.session.destroy((error)=>{
        console.log("Berhasil LogOut");
        res.redirect('/');
    })
});
app.listen(port, ()=> console.log(`Server is listening on port ${port}`));
