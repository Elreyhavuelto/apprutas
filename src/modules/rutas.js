const express = require('express');
const {
    getPointsByZone: getPointsByZoneNeo4j,
    setPoint: setPointNeo4j,
    setRelationPoint: setRelationPointNeo4j,
    getRelationPointsByZone
} = require( '../models/neo4jPuntos');

const { getPuntosByZona, getPuntosByZonaNoIds, getPuntosOrdenados } = require('../models/puntos');
const { setRutas, getRutasByViaje } = require('../models/rutas');
const { setViaje, getViajesByZona, getViajesById } = require('../models/viajes');
const { setViajeRutasRel } = require('../models/viajeRutasRel');
const { getUsuariosByRol } = require('../models/usuarios');
const { getVehiculos } = require('../models/vehiculo');

const { osmRouteApi } = require('../api/osmApi');
const { addSecondsToTime, showTime, showDistance, getTimeZone, getDateFormat } = require('../helpers/dateHelper');


const router = express.Router();
router.use(express.json());

// Creacion de matriz de distancia
router.post('/', async(req , res) => {
    
    const { zona } = req.body
    
    const points = await getPuntosByZona(zona) // Obtener las ubicaciones de una zona
    // Comprobacion de los puntos en neo4j
    await comparePointsNeo4j(points, zona)

    const relationsPoints = await getRelationPointsByZone(zona, 'OSM') // Obtener las relaciones de una zona de la DB de Neo4j

    for(const point1 of points) { // Iterar las ubicaciones = point1
        for(const point2 of points) { // Iterar las ubicaciones = point2
            if(point1.id === point2.id) continue // Comparar las ubicaciones point1 !== point2
            try {
                //Comprobar si la relacion ya existe
                const isRelation = relationsPoints.some(pointFind => pointFind.start.id == point1.id && pointFind.end.id == point2.id)
                if(isRelation) continue


                const { data } = await osmRouteApi.get(`/${point1.longitud},${point1.latitud};${point2.longitud},${point2.latitud}`,{
                    params: {
                        overview: 'full'
                    }
                }) // Realizar la peticion a OSM
                const { routes } = data
                if(routes.length === 0) continue

                const { distance, duration, geometry } = routes[0]

                // Guardar el resultado a neo4j
                await setRelationPointNeo4j({
                    idStart: point1.id,
                    idEnd: point2.id,
                    distance,
                    time: duration,
                    codedPolylines: geometry
                }, 'OSM')

                console.log(`punto1: ${point1.latitud},${point1.longitud} punto2: ${point2.latitud},${point2.longitud}`)
                console.log(`distancia: ${distance} duracion: ${duration}`)

            }catch(error) {
                console.log(error)
            }
        }
    }
    res.json({ message: `Rutas creadas con: ${points.length} puntos` })
})

// Creacion de rutas
router.post('/create', async(req, res) => {
    const {zone, notPoints, startTime, timeService, driver, truck, auxs, turn} = req.body
    const startPoint = await getPuntosOrdenados(zone)
    let startPointObj = startPoint[0]

    const pointsNotFound = [startPointObj.id, ... notPoints]

    const points = await getPuntosByZonaNoIds(String(zone), pointsNotFound) // Obtener las ubicaciones de una zona
    const relationsPoints = await getRelationPointsByZone(String(zone), 'OSM') // Obtener las relaciones de una zona de la DB de Neo4j

    const allPoints = JSON.parse(JSON.stringify(points))
    // Creacion de la ruta
    const routes = route(points.filter(point => point.status === 1), allPoints, relationsPoints, [{point: startPointObj, properties: {}}])

    const routesInsert = []
    let consecutive = 1
    for(const {properties, point} of routes){
        if(!point) continue

        const {distance, time, codedPolylines} = properties

        let startTimeRoute = ''
        let endTimeRoute  = ''
        const service = timeService * 60
        if(consecutive === 1) {
            startTimeRoute = startTime
        }else{
            const lastRoute = routesInsert[consecutive - 2]
            startTimeRoute = addSecondsToTime(lastRoute.hora_fin, time || 0)
        }
        endTimeRoute = addSecondsToTime(startTimeRoute, service)
        routesInsert.push({
            consecutivo: consecutive,
            hora_inicio: startTimeRoute,
            hora_fin: endTimeRoute,
            servicio: service,
            distancia: distance || 0,
            tiempo: time || 0,
            polylinea: codedPolylines || '',
            fk_punto: point.id
        })
        consecutive++
    }


    const routesDB = await setRutas(routesInsert)

    const totalDistance = routesDB.reduce((acc, route) => acc + route.distancia, 0)
    const totalTimeTravel = routesDB.reduce((acc, route) => acc + route.tiempo, 0)
    const totalTimeService = routesDB.reduce((acc, route) => acc + route.servicio, 0)
    const routesIds = routesDB.map(route => route.id)

    const viaje = await setViaje({
        distanciaTotal: totalDistance,
        viajeTotal: totalTimeTravel,
        servicioTotal: totalTimeService,
        zona: zone,
        conductor: driver,
        camion: truck,
        auxs: auxs.join(','),
        turno: turn
    })

    await setViajeRutasRel(viaje.insertId, routesIds)
    res.json({ message: "Ruta creada correctamente"})
})

router.get('/', async(req, res) => {
    try {
        const { id } = req.query
        const travelDB = await getViajesById(id)
        const pointsDB = await getPuntosByZona(travelDB.zona || '')
        const rutasDB = await getRutasByViaje(travelDB.id)

        const totalTime = (travelDB?.tiempo_viaje_total || 0) + (travelDB?.tiempo_servicio_total || 0)
        const travel = {
            distance: showDistance(travelDB?.distancia_total || 0, true),
            totalTime: showTime(totalTime),
            hour: `${rutasDB.at(0)?.hora_inicio} - ${addSecondsToTime(rutasDB.at(0)?.hora_inicio, totalTime)} hrs.`,
            driver: travelDB?.conductor,
            truck: travelDB?.camion,
            auxs: travelDB?.auxs.split(','),
            turn: travelDB?.turno,
            date: getDateFormat(getTimeZone(travelDB?.creacion)),
            points: pointsDB.filter(point => {
                return !rutasDB.some(route => route.fk_punto === point.id) // !true => false
            }),
            routes: rutasDB.map(route => {
                const punto = pointsDB.find(point => point.id === route.fk_punto)
                if(!punto) return
                return {
                    point: {
                        id: punto.id,
                        key: punto.clave,
                        latitude: punto.latitud,
                        longitude: punto.longitud,
                        priority: punto.prioridad,
                        status: punto.status,
                    },
                    properties: {
                        distance: showDistance(route.distancia, true),
                        time: showTime(route.tiempo),
                        polyline: route.polylinea,
                        startTime: route.hora_inicio
                    }
                }
            })
        }

        res.status(200).json({
            data: travel
        })
    } catch (e) {
        console.error(e)
        res.status(400).json(e.message)
    }
})

router.get('/travels', async(req, res) => {
    const { zone } = req.query
    const travels = await getViajesByZona(zone)
    const respuesta = travels.map(travel => {
        return {
            id: travel.id,
            date: getDateFormat(getTimeZone(travel.creacion), 'yyyy-MM-dd'),
            turn: travel.turno
        }
    })
    res.json({data: respuesta})
})

router.get('/information', async(req, res) => {
    const conductores = await getUsuariosByRol('Conductores')
    const auxiliares = await getUsuariosByRol('Auxiliares')
    const vehiculos = await getVehiculos()
    res.json({data: {
        conductores,
        auxiliares,
        vehiculos
    }})
})

const comparePointsNeo4j = async(points, zone) => {
    const pointsNeo4j = await getPointsByZoneNeo4j(zone) // Obtener las ubicaciones de una zona de la DB de Neo4j
    // Comprobacion de los puntos en neo4j
    for(const point of points) {
        const isExist = pointsNeo4j.some(pointFind => pointFind.id === point.id)
        if(isExist) continue

        //Crear el punto en neo4j
        await setPointNeo4j({
            id: point.id,
            longitude: point.longitud,
            latitude: point.latitud,
            zone
        })
    }
}
// Funcion recursiva de la ruta
const route = (points, allPoints, relations, routes) => {
    if(points.length === 0) {
        return routes
    }
    //Buscar el punto mas cercano a partir de la ultima ubicacion
    const ultPoint = routes[routes.length - 1].point
    const pointStarts = relations.filter((point) => point.start.id === ultPoint.id)
    //Buscar la relacion mas corta
    const nextPointNeo4j = getShortestRoute(pointStarts, points, allPoints, ultPoint)
    if(nextPointNeo4j) {
        //Agregar el punto a la ruta
        const nextPointIndex = points.findIndex(point => point.id === nextPointNeo4j.end.id)
        routes.push({
            point: points[nextPointIndex],
            properties: nextPointNeo4j.properties
        })
        //Eliminar el punto de la lista de puntos
        removeObjectToArr(points, points[nextPointIndex])
    }else{
        console.log('No se encontro una ruta')
        removeObjectToArr(points, points[0])
    }

    // Se manda a llamar a si misma
    return route(points, allPoints, relations, routes)
}

const getShortestRoute = (relations, points, allPoints, point) => {
    //Manejar la ruta por distancia
    let distanceObj = undefined
    distanceObj = relations.find((relation) => relation.end.id === points[0].id)
    if(!distanceObj) return undefined

    // Hace busqueda de toda la informacion
    for(const relation of relations) {
        const isExist = points.some(pointF => pointF.id === relation.end.id)
        if(!isExist) continue

        const pointRelation = allPoints.find(pointF => pointF.id === relation.end.id)
        if (!pointRelation) continue;

        // Determinar si es de mayor prioridad
        let isPriority = (points[0].prioridad || 0) >= (pointRelation.prioridad || 0);

        // Asegurarse de que la distancia esté bien definida y sea un número
        if (!relation.properties || isNaN(Number(relation.properties.distance))) continue;

        // Convertir la distancia a número antes de compararla
        const relationDistance = Number(relation.properties.distance);

        // Comparar la distancia si la prioridad lo permite
        if (isPriority && relationDistance < distanceObj.properties.distance) {
            distanceObj = relation;  // Actualizar si la relación actual es mejor
        }
    }
    return distanceObj
}

const removeObjectToArr = ( arr, item) => {
    let i = arr.indexOf( item )

    if ( i !== -1 ) {
        arr.splice( i, 1 )
    }
}


module.exports = router;