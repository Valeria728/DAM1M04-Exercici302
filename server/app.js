const express = require('express');
const path = require('path');
const hbs = require('hbs');
const mysql = require('mysql2/promise');
require('dotenv').config();

const app = express();
const PORT = 3000;

app.use(express.static(path.join(__dirname, '../public')));

app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));

hbs.registerPartials(path.join(__dirname, 'views/partials'));

let db;

/* -------------------- RUTAS -------------------- */

app.get('/', async (req, res) => {
  try {
    const [movies] = await db.query(`
      SELECT film_id, title, release_year
      FROM film
      LIMIT 5
    `);

    const [categories] = await db.query(`
      SELECT name
      FROM category
      LIMIT 5
    `);

    for (let movie of movies) {
      const [actors] = await db.query(`
        SELECT a.first_name, a.last_name
        FROM actor a
        JOIN film_actor fa ON a.actor_id = fa.actor_id
        WHERE fa.film_id = ?
      `, [movie.film_id]);

      movie.actors = actors;
    }

    res.render('index', { movies, categories });

  } catch (err) {
    console.error(err);
    res.send('Error cargando datos');
  }
});

app.get('/movies', async (req, res) => {
  try {
    const [movies] = await db.query(`
      SELECT film_id, title, release_year
      FROM film
      LIMIT 15
    `);

    for (let movie of movies) {
      const [actors] = await db.query(`
        SELECT a.first_name, a.last_name
        FROM actor a
        JOIN film_actor fa ON a.actor_id = fa.actor_id
        WHERE fa.film_id = ?
      `, [movie.film_id]);

      movie.actors = actors;
    }

    res.render('movies', { movies });

  } catch (err) {
    console.error(err);
    res.send('Error cargando películas');
  }
});

app.get('/customers', async (req, res) => {
  try {
    const [customers] = await db.query(`
      SELECT customer_id, first_name, last_name
      FROM customer
      LIMIT 25
    `);

    for (let customer of customers) {
      const [rentals] = await db.query(`
        SELECT rental_date
        FROM rental
        WHERE customer_id = ?
        LIMIT 5
      `, [customer.customer_id]);

      customer.rentals = rentals;
    }

    res.render('customers', { customers });

  } catch (err) {
    console.error(err);
    res.send('Error cargando clientes');
  }
});

console.log("DB USER =", process.env.DB_USER);
console.log("DB HOST =", process.env.DB_HOST);

/* -------------------- ARRANQUE DEL SERVIDOR -------------------- */

async function startServer() {
  try {
    db = await mysql.createConnection({
      host: process.env.DB_HOST || '127.0.0.1',
      port: process.env.DB_PORT || 3307,
      user: process.env.DB_USER || 'super',
      password: process.env.DB_PASS || '1234',
      database: process.env.DB_NAME || 'sakila'
    });

    console.log('✅ Conectado a la base de datos');

    app.listen(PORT, () => {
      console.log(`✅ Servidor escuchando en http://localhost:${PORT}`);
    });

  } catch (err) {
    console.error('❌ Error conectando a la base de datos:', err);
  }
}

startServer();