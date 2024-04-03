
const mongoose = require('mongoose') 
const express = require('express'); 
var bodyParser = require('body-parser')

const path = require('path'); 


const app = express();


const Posts = require('./Posts.js')



mongoose.connect('mongodb+srv://comerciallojao031:Rzcb097jlsdZ8idq@cluster0.nr1qkuy.mongodb.net/dankicode?retryWrites=true&w=majority&appName=Cluster0',{useNewUrlParser:true, useUnifiedTopology: true}).then(()=>{
    console.log('conectado com sucesso');
}).catch((err)=>{
    console.log(err.message);
});


app.use( bodyParser.json() );       
app.use(bodyParser.urlencoded({     
  extended: true
})); 

app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

 
app.use('/public', express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, '/pages'));


app.get('/', (req, res) => {
    
    if (req.query.busca == null) {
        
        Posts.find({}).sort({ '_id': -1 }).then(posts => {
            posts = posts.map((val) => {
                return {
                    titulo: val.titulo,
                    conteudo: val.conteudo,
                    descricaoCurta: val.conteudo.substr(0, 100),
                    imagem: val.imagem,
                    slug: val.slug,
                    categoria: val.categoria,
                    views: val.views
                }
            })

            Posts.find({}).sort({ 'views': -1 }).limit(3).then(postsTop => {
                postsTop = postsTop.map((val) => {
                    return {
                        titulo: val.titulo,
                        conteudo: val.conteudo,
                        descricaoCurta: val.conteudo.substr(0, 100),
                        imagem: val.imagem,
                        slug: val.slug,
                        categoria: val.categoria,
                        views: val.views
                    }
                });

                res.render('home', { posts: posts, postsTop: postsTop });
            }).catch(error => {
                console.error(error);
                res.status(500).send('Erro ao buscar as postagens mais populares.');
            });
        }).catch(error => {
            console.error(error);
            res.status(500).send('Erro ao buscar posts.');
        });

    } else {
        Posts.find({ titulo: { $regex: req.query.busca, $options: 'i' } })
     .then(posts => {
        const postsFormatted = posts.map((val) => {
            return {
                titulo: val.titulo,
                conteudo: val.conteudo,
                descricaoCurta: val.conteudo.substr(0, 300),
                imagem: val.imagem,
                slug: val.slug,
                categoria: val.categoria,
                views: val.views
            };
        });
         res.render('busca', { posts: postsFormatted, contagem: posts.length });
     })
     .catch(error => {
         console.error(error);
         res.status(500).send('Erro ao buscar posts.');
     });
    }
});


app.get('/:slug', async (req, res) => {
    try {
        const resposta = await Posts.findOneAndUpdate(
            { slug: req.params.slug },
            { $inc: { views: 1 } },
            { new: true }
        ).exec();

        if (!resposta) {
            res.status(404).send('Post não encontrado.');
            return;
        }

        if (req.query.busca == null) {
            const postsTop = await Posts.find({}).sort({ 'views': -1 }).limit(3);

            const postsTopFormatted = postsTop.map((val) => {
                return {
                    titulo: val.titulo,
                    conteudo: val.conteudo,
                    descricaoCurta: val.conteudo.substr(0, 100),
                    imagem: val.imagem,
                    slug: val.slug,
                    categoria: val.categoria,
                    views: val.views
                };
            });

            res.render('single', { noticia: resposta, postsTop: postsTopFormatted });
        } else {
            res.render('busca', {});
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Erro ao buscar e atualizar post.');
    }
});



app.listen(5000,()=>{
    console.log('server rodando!');
})