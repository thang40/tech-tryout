
var platesModel = require('../model/Plates');

exports.getPlates = function (req, res) {


    var searchStr = req.body.search.value;
    if(req.body.search.value)
    {
            var regex = new RegExp(req.body.search.value, "i")
            searchStr = { $or: [{'_id':regex },{'country': regex},{'plate_number': regex},{'plate_code': regex},{'state': regex }] };
    }
    else
    {
         searchStr={};
    }

    var recordsTotal = 0;
    var recordsFiltered=0;

    platesModel.count({}, function(err, c) {
        recordsTotal=c;
        console.log(c);
        platesModel.count(searchStr, function(err, c) {
            recordsFiltered=c;
            console.log(c);
            console.log(req.body.start);
            console.log(req.body.length);
                platesModel.find(searchStr, '_id event_time plate_number plate_code state country vehicle_img plate_img is_junk is_valid_code is_valid_plate is_valid_source',{'skip': Number( req.body.start), 'limit': Number(req.body.length)}, function (err, results) {
                    if (err) {
                        console.log('error while getting results'+err);
                        return;
                    }
                    var data = JSON.stringify({
                        "draw": req.body.draw,
                        "recordsFiltered": recordsFiltered,
                        "recordsTotal": recordsTotal,
                        "data": results
                    });
                    res.send(data);
                });

          });
   });
};

async function isDuplicated(number, code, time){
    var _duplicate = false;
    await platesModel.find({$and:[{'plate_number':number},{'plate_code':code}]}, '_id event_time plate_number plate_code state country vehicle_img plate_img',{'sort': {'_id': -1}}, function (err, results) {
        if (err) return false;
        if(results.length>0){
            var _t = results[0]['event_time'];
            console.log("New: "+time);
            console.log("Old: "+_t);
            var _def = time - _t;
            _def = _def/1000/60;
            if(_def <= 15){
                console.log("#Duplicate#");
                _duplicate = true;
            }
        }
     });
    return _duplicate;
}

exports.newPlate = function (req, res) {
    console.dir("-----------------------------------------------");
//    console.dir(req.body);
    var data = req.body;
//    var data = JSON.parse(stdout);
    if (data.best_plate != undefined) {
        console.log("\n\n\nNew plate found.\n\n"+ data.best_plate_number);
        var _tmp_plate = "", _tmp_region = "", _code = "", _number = "", _state = "", _country = "", _timestamp = "";
        _tmp_plate = data.best_plate_number +"";
        _tmp_plate = _tmp_plate.split("-");
        if(_tmp_plate.length > 1){
            _code = _tmp_plate[0];
            _number = _tmp_plate[1];
        } else {
            _number = _tmp_plate[0];
        }

        _tmp_region = data.best_region+"";
        _tmp_region = _tmp_region.split("-");
        if(_tmp_region.length > 1){
            _country = _tmp_region[0];
            _state = _tmp_region[1];
        } else {
            _state = _tmp_region[1];
        }

        _timestamp = new Date(1*data.epoch_start);
        _timestamp = _timestamp.toLocaleString();

        var _duplicate = false;
        platesModel.find({$and:[{'plate_number':_number},{'plate_code':_code}]}, '_id event_time plate_number plate_code state country vehicle_img plate_img',{'sort': {'_id': -1}}, function (err, results) {
            if (err) _duplicate = false;
            else if(results.length>0){
                var _t = results[0]['event_time'];
                var time = data.epoch_start;
                console.log("New: "+time);
                console.log("Old: "+_t);
                var _def = time - _t;
                _def = _def/1000/60;
                if(_def <= 15){
                    console.log("#Duplicate#");
                    _duplicate = true;
                }
            }

            if(_duplicate == false){
                platesModel.create(
                {
                    event_time: data.epoch_start,
                    plate_number: _number,
                    plate_code: _code,
                    state: _state,
                    country: _country,
                    plate_img: data.best_plate.plate_crop_jpeg,
                    vehicle_img: data.vehicle_crop_jpeg,
                    data: data
                });
            } else{
                console.log("not inserted");
            }
         });
//        if(isDuplicated(_number, _code, data.epoch_start) == false){
//            platesModel.create(
//                {
//                    event_time: data.epoch_start,
//                    plate_number: _number,
//                    plate_code: _code,
//                    state: _state,
//                    country: _country,
//                    plate_img: data.best_plate.plate_crop_jpeg,
//                    vehicle_img: data.vehicle_crop_jpeg
//                });
//        } else{
//             console.log("not inserted");
//        }
    } else {
        console.log("\n\n\nNo license plate found.\n\n");
    }
    res.send('Thank you!');
}

exports.updatePlate = function ({body}, res) {
    const updatedFields = {
        [body.field]: body.value
    };
    platesModel.updateOne({ _id: body.id }, updatedFields, function (err, record) {
        if(err) {
            res.send(err);
        }
        res.end();
    });
};
