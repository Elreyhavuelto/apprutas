const neo4j = require('neo4j-driver');

const user = 'neo4j';
const password = 'afAF^73DSF3^2024';
const host = 'neo4j://localhost:7687';

const driver = neo4j.driver(
    host,
    neo4j.auth.basic(user, password)
);

module.exports = driver