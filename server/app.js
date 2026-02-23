const express = require('express');
const path = require('path');
const hbs = require('hbs');
const mysql = require('mysql2/promise');

const app = express();
const PORT = 3000;

app.use(express.static(path.join(__dirname, '../public')));

app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));

hbs.registerPartials(path.join(__dirname, 'views/partials'));

let db;

async function initDB() {
  db = await mysql.createConnection({
  host: '127.0.0.1',
  port: 3306,
  user: 'root',
  password: 'valeria.18',
  database: 'sakila'
});
}

initDB();

app.get('/', async (req, res) => {
  try {
    // 5 películas
    const [movies] = await db.query(`
      SELECT film_id, title, release_year
      FROM film
      LIMIT 5
    `);

    // 5 categorías
    const [categories] = await db.query(`
      SELECT name
      FROM category
      LIMIT 5
    `);

    // añadir actores a cada película
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

app.listen(PORT, () => {
  console.log(`✅ Servidor escuchando en http://localhost:${PORT}`);
});