const boom = require('@hapi/boom');
const neo4j = require('../conexionNeo4j');
const setPoint = async (props) => {
    try {
        const session = neo4j.session();

        const query = 'CREATE (:Point {id: $id, longitude: $longitude, latitude: $latitude, zone: $zone})';

        const result = await session.executeWrite(tx => tx.run(
            query,
            props
        ));

        return result;
    } catch (error) {
        throw boom.badImplementation(`Something went wrong: ${error}`);
    }
};
const getPointsByZone = async (zone) => {
    try {
        const session = neo4j.session();

        const query = 'MATCH (p:Point) WHERE p.zone = $zone RETURN p';

        const result = await session.executeRead(tx => tx.run(
            query,
            { zone }
        ));

        return result.records.map(record => record.get('p').properties);
    } catch (error) {
        throw boom.badImplementation(`Something went wrong: ${error}`);
    }
};

const setRelationPoint = async (props, conexion) => {
    try {
        const session = neo4j.session();

        const query = 'MATCH (pto1:Point {id: $idStart}), (pto2:Point {id: $idEnd}) CREATE (pto1)-[:' + conexion + ' {distance: $distance, time: $time, codedPolylines: $codedPolylines}]->(pto2)';

        const result = await session.executeWrite(tx => tx.run(
            query,
            props
        ));

        return result;
    } catch (error) {
        throw boom.badImplementation(`Something went wrong: ${error}`);
    }
};

const getRelationPointsByZone = async (zone, conexion) => {
    try {
        const session = neo4j.session();

        const query = `MATCH r=(p1:Point)-[c:${conexion}]->(p2:Point) WHERE p1.zone = $zone RETURN r, c`;

        const result = await session.executeRead(tx => tx.run(
            query,
            { zone }
        ));

        const response = [];
        for (const record of result.records) {
            const { properties } = record.get('c');
            const { start, end } = record.get('r');
            const responseProps = {
                start: start.properties,
                end: end.properties,
                properties
            };
            response.push(responseProps);
        }
        return response;
    } catch (error) {
        throw boom.badImplementation(`Something went wrong: ${error}`);
    }
};

module.exports = {
    setPoint,
    getPointsByZone,
    setRelationPoint,
    getRelationPointsByZone
};