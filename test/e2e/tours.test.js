const { assert } = require('chai');
const request = require('./request');
const { dropCollection } = require('./db');
const getLocationWeather = require('../../lib/util/location-weather');

const checkOk = res => {
    assert.equal(res.status, 200, 'expected 200 HTTP status code');
    return res;
};

describe('Tours API', () => {
    beforeEach(() => dropCollection('tours'));
    let tables;

    beforeEach(() => {
        const data = {
            title: 'Tables & Chairs',
            activities: ['pony rides', 'dancing bears', 'band', 'snacks'],
            launchDate: new Date(2019, 2, 18),
            stops: [{
                location: {
                    city: 'Portland',
                    state: 'OR',
                    zip: '97212'
                },
                weather: {
                    temperature: '92 F',
                    condition: 'Sunny'
                }
            }]
        };
        return request
            .post('/api/tours')
            .send(data)
            .then(checkOk)
            .then(({ body }) => {
                assert.deepEqual(body.title, data.title);
                tables = body;
            });
    });

    it('should GET all tours', () => {
        return request
            .get('/api/tours')
            .then(checkOk)
            .then(({ body }) => {
                assert.deepEqual(body, [tables]);
            });
    });

    it('should GET a tour by id', () => {
        return request
            .get(`/api/tours/${tables._id}`)
            .then(checkOk)
            .then(({ body }) => {
                assert.deepEqual(body, tables);
            });
    });

    it.skip('should GET location/weather data', () => {
        return getLocationWeather('96813')
            .then(data => {
                assert.isDefined(data);
            });
    });

    it('should POST a stop to a tour', () => {
        const data = { zip: '96813' };
        const location = {
            city: 'Honolulu',
            state: 'HI',
            zip: '96813'
        };
        return request
            .post(`/api/tours/${tables._id}/stops`)
            .send(data)
            .then(checkOk)
            .then(({ body }) => {
                assert.deepEqual(body.location, location);
                assert.isDefined(body.weather.temperature);
                assert.isDefined(body.weather.condition);
            });
    });

    it('should DELETE a stop', () => {
        return request
            .del(`/api/tours/${tables._id}/stops/${tables.stops[0]._id}`)
            .then(checkOk)
            .then(({ body }) => {
                assert.isTrue(body.removed);
            });
    });

    describe('Tours API - error handler', () => {

        it('should throw 404 error on bad path', () => {
            return request
                .get('/api/tour')
                .then(res => {
                    assert.equal(res.status, 404);
                });
        });
    });

});