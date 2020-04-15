const graphql = require("graphql");

const Plate = require("../model/Plates");
const ZipCode = require("../model/ZipCodes");

const {
    GraphQLObjectType,
    GraphQLString,
    GraphQLBoolean,
    GraphQLSchema,
    GraphQLID,
    GraphQLFloat,
    GraphQLList,
    GraphQLNonNull,
    GraphQLInt,
    GraphQLInputObjectType,
    GR,
} = graphql;

const PlateType = new GraphQLObjectType({
    name: "plates",
    fields: () => ({
        id: {
            type: GraphQLID,
        },
        event_time: {
            type: GraphQLString,
        },
        plate_number: {
            type: GraphQLString,
        },
        plate_code: {
            type: GraphQLString,
        },
        state: {
            type: GraphQLString,
        },
        country: {
            type: GraphQLString,
        },
        plate_img: {
            type: GraphQLString,
        },
        vehicle_img: {
            type: GraphQLString,
        },
        data: {
            type: GraphQLString,
        },
        is_junk: {
            type: GraphQLBoolean,
        },
        is_valid_code: {
            type: GraphQLBoolean,
        },
        is_valid_plate: {
            type: GraphQLBoolean,
        },
        is_valid_source: {
            type: GraphQLBoolean,
        },
    }),
});

const ZipCodeType = new GraphQLObjectType({
    name: "zipcodes",
    fields: () => ({
        id: {
            type: GraphQLID,
        },
        city: {
            type: GraphQLString,
        },
        pop: {
            type: GraphQLInt,
        },
        state: {
            type: GraphQLString,
        },
    }),
});

const PaginationArgType = new GraphQLInputObjectType({
    name: "PaginationArg",
    fields: {
        offset: {
            type: GraphQLInt,
            description: "Skip n rows.",
        },
        first: {
            type: GraphQLInt,
            description: "First n rows after the offset.",
        },
    },
});

const PaginatedListType = (ItemType) =>
    new GraphQLObjectType({
        name: "Paginated" + ItemType,
        fields: {
            count: { type: GraphQLInt },
            data: { type: new GraphQLList(ItemType) },
        },
    });

const RootQuery = new GraphQLObjectType({
    name: "RootQueryType",
    fields: {
        plate: {
            type: PlateType,
            args: {
                id: {
                    type: GraphQLID,
                },
            },
            resolve(parent, args) {
                return Plate.findById(args.id);
            },
        },
        zipcode: {
            type: ZipCodeType,
            args: {
                id: {
                    type: GraphQLID,
                },
            },
            resolve(parent, args) {
                return ZipCode.findById(args.id);
            },
        },
        plates: {
            type: PaginatedListType(PlateType),
            args: {
                searchText: {
                    type: GraphQLString,
                },
                pagination: {
                    type: PaginationArgType,
                    defaultValue: { offset: 0, first: 10 },
                },
            },
            resolve(parent, args) {
                const { searchText, pagination } = args;
                const { offset, first } = pagination;
                console.log(searchText);
                if (searchText === "") {
                    return {
                        data: Plate.find({ isDeleted: false }).skip(offset).limit(first).exec(),
                        count: Plate.count(),
                    };
                }
                return {
                    data: Plate.find({ $text: { $search: `/${searchText}/` }, isDeleted: false })
                        .skip(offset)
                        .limit(first)
                        .exec(),
                    count: Plate.count(),
                };
            },
        },
        zipcodes: {
            type: new GraphQLList(ZipCodeType),
            resolve(parent, args) {
                return ZipCode.find({});
            },
        },
    },
});

const Mutation = new GraphQLObjectType({
    name: "Mutation",
    fields: {
        addPlate: {
            type: PlateType,
            args: {
                event_time: {
                    type: new GraphQLNonNull(GraphQLString),
                },
                plate_number: {
                    type: new GraphQLNonNull(GraphQLString),
                },
                plate_code: {
                    type: new GraphQLNonNull(GraphQLString),
                },
                state: {
                    type: new GraphQLNonNull(GraphQLString),
                },
                country: {
                    type: new GraphQLNonNull(GraphQLString),
                },
                plate_img: {
                    type: new GraphQLNonNull(GraphQLString),
                },
                vehicle_img: {
                    type: new GraphQLNonNull(GraphQLString),
                },
                data: {
                    type: new GraphQLNonNull(GraphQLString),
                },
                is_junk: {
                    type: new GraphQLNonNull(GraphQLBoolean),
                },
                is_valid_code: {
                    type: new GraphQLNonNull(GraphQLBoolean),
                },
                is_valid_plate: {
                    type: new GraphQLNonNull(GraphQLBoolean),
                },
                is_valid_source: {
                    type: new GraphQLNonNull(GraphQLBoolean),
                },
            },
            resolve(parent, args) {
                let dish = new Plate({
                    event_time: args.event_time,
                    plate_number: args.plate_number,
                    plate_code: args.plate_code,
                    state: args.state,
                    country: args.country,
                    plate_img: args.plate_img,
                    vehicle_img: args.vehicle_img,
                    data: args.data,
                    is_junk: args.is_junk,
                    is_valid_code: args.is_valid_code,
                    is_valid_plate: args.is_valid_plate,
                    is_valid_source: args.is_valid_source,
                });
                return Plate.save();
            },
        },
        editPlate: {
            type: GraphQLBoolean,
            args: {
                id: {
                    type: GraphQLID,
                },
                data: {
                    type: new GraphQLInputObjectType({
                        name: "updatePlate",
                        fields: () => ({
                            event_time: {
                                type: GraphQLString,
                            },
                            plate_number: {
                                type: GraphQLString,
                            },
                            plate_code: {
                                type: GraphQLString,
                            },
                            state: {
                                type: GraphQLString,
                            },
                            country: {
                                type: GraphQLString,
                            },
                            plate_img: {
                                type: GraphQLString,
                            },
                            vehicle_img: {
                                type: GraphQLString,
                            },
                            data: {
                                type: GraphQLString,
                            },
                            is_junk: {
                                type: GraphQLBoolean,
                            },
                            is_valid_code: {
                                type: GraphQLBoolean,
                            },
                            is_valid_plate: {
                                type: GraphQLBoolean,
                            },
                            is_valid_source: {
                                type: GraphQLBoolean,
                            },
                        }),
                    }),
                },
            },
            resolve(parent, args) {
                const { id, data } = args;
                console.log(id, data);
                Plate.updateOne({ _id: id }, { ...data }, function (err, affected, resp) {
                    console.log(err, affected);
                });
                return true;
            },
        },
        deletePlate: {
            type: PlateType,
            args: {
                id: {
                    type: GraphQLID,
                },
            },
            resolve(parent, args) {
                const { id } = args;
                return Plate.updateOne({ id }, { isDeleted: true }, function (err, res) {
                    // Updated at most one doc, `res.modifiedCount` contains the number
                    // of docs that MongoDB updated
                });
            },
        },
        addZipCode: {
            type: ZipCodeType,
            args: {
                city: {
                    type: new GraphQLNonNull(GraphQLString),
                },
                pop: {
                    type: new GraphQLNonNull(GraphQLInt),
                },
                state: {
                    type: new GraphQLNonNull(GraphQLString),
                },
            },
            resolve(parent, args) {
                let chef = new Chef({
                    city: args.city,
                    pop: args.pop,
                    state: args.state,
                });
                return ZipCode.save();
            },
        },
    },
});

module.exports = new GraphQLSchema({
    query: RootQuery,
    mutation: Mutation,
});
