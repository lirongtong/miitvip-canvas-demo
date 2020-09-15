/*
 * +-------------------------------------------+
 * |                  MIITVIP                  |
 * +-------------------------------------------+
 * | Copyright (c) 2020 makeit.vip             |
 * +-------------------------------------------+
 * | Author: makeit <lirongtong@hotmail.com>   |
 * | Homepage: https://www.makeit.vip          |
 * | Github: https://git.makeit.vip            |
 * | Date: 2020-9-10 9:44                      |
 * +-------------------------------------------+
 */
const Koa = require('koa');
const cors = require('@koa/cors');
const redis = require('redis');

/** app */
const app = new Koa();
app.use(cors);

/** format current time */
function getTime() {
	const date = new Date(),
		year = date.getFullYear().toString(),
		month = date.getMonth(),
		day = date.getDate(),
		hour = date.getHours(),
		mins = date.getMinutes(),
		secs = date.getSeconds(),
		mon = month + 1;
	return `${year}-${mon < 10 ? '0' + mon : mon}-${day < 10 ? '0' + day : day} ${hour < 10 ? '0' + hour : hour}:${mins < 10 ? '0' + mins : mins}:${secs < 10 ? '0' + secs : secs}`;
}

/** redis */
const pub = redis.createClient(6379, '127.0.0.1');
pub.on('error', (err) => {
	console.log(`redis server error: ${err} ( ${getTime()} )`);
}).on('connect', () => {
	console.log(`redis server is up and running ... ( ${getTime()} )`);
});

/** socket instance */
const prefix = 'mi-',
	server = require('http').createServer(app.callback()),
	io = require('socket.io')(server);
io.set('origins', '*:*');
console.log(`socket server is up and running... ( ${getTime()} )`);

/** events */
io.on('connection', (socket) => {
	console.log(`handshake：${socket.handshake.address} ( ${getTime()} )`);
	/** listeners */
	socket.on('init', () => {

	}).on('disconnect', () => {
		console.log(`waved：${socket.handshake.address} ( ${getTime()} )`);
	})
});


