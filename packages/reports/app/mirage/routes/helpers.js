import Ember from 'ember';
import _ from 'lodash';

/**
 * JSON-API to JSON conversion
 *
 * @function jsonApiToJson
 * @param {Object} jsonApiObject - Json API Object
 * @param {Object} [relationshipMap] - relationship map
 * @returns {Object} - JSON Object
 */
export function jsonApiToJson(jsonApiObject, relationshipMap) {
  let json = {},
      id = jsonApiObject.data.id;

  if (id) {
    json.id = id;
  }

  // extract attributes
  Object.assign(json, jsonApiObject.data.attributes);

  // extract relationships
  if (relationshipMap) {
    Object.assign(json, extractRelationships(jsonApiObject.data.relationships, relationshipMap));
  }
  return json;
}

/**
 * Extracts properties and their values from the given JSON API relationships
 *
 * @param {Object} jsonApiRels - JSON-API relationships
 * @param {Object} relationshipMap - relationship map
 * @returns {Object} - Object containing properties and their associated values
 */
export function extractRelationships(jsonApiRels, relationshipMap) {

  let properties = {};

  // Ignore JSON-API relationships not specified in relationship map
  relationshipMap.forEach(relationship => {
    let property = relationship.property;
    if (jsonApiRels[property]) {
      let relationshipData = jsonApiRels[property].data,
          propertyVal;

      if (Ember.isArray(relationshipData)) {
        Ember.assert('data array should have hasMany relationship', relationship.relation === 'hasMany');
        propertyVal = Ember.A(relationshipData).mapBy('id');
      } else {
        propertyVal = relationshipData.id;
      }

      properties[property] = propertyVal;
    }
  });

  return properties;
}

/**
 * Builds JSON-API's data object
 *
 * @function buildJsonApiDataObj
 * @param {Object} jsonObject - JSON Object
 * @param {String} type - type of data
 * @param {Object} [relationshipMap] - relationship map
 * @returns {Object} - JSON-Api body Object
 */
export function buildJsonApiDataObj(jsonObject, type, relationshipMap) {

  let attributes = Object.assign({}, jsonObject),
      relationships;
  delete attributes.id; // removing id attr from JSON-API attributes

  if (relationshipMap) {
    relationships = mapRelations(attributes, relationshipMap);

    // remove relationship properties from attributes
    relationshipMap.mapBy('property').forEach((property) => {
      delete attributes[property];
    });
  }

  //Build JSON API data structure
  let jsonApiData = {
    type,
    id: jsonObject.id,
    attributes
  };

  if(relationships) {
    jsonApiData.relationships = relationships;
  }

  return jsonApiData;
}

/**
 * Builds the included section of JSON-API object
 *
 * @function buildJsonApiIncludedArray
 * @param {Object} includeObj - include object in the form {type: <type>, data: <array of records to include>}
 * @returns {Array} - JSON-API included array
 */
export function buildJsonApiIncludedArray(includeObj, relationshipMap) {
  let type = includeObj.type;
  return includeObj.data.map(record => {
    return buildJsonApiDataObj(record, type, relationshipMap[type]);
  });
}

/**
 * JSON to JSON-API conversion
 *
 * @function jsonToJsonApi
 * @param {Object|Array} jsonObject - JSON Object
 * @param {String} type - type of data
 * @param {Object} [relationshipMap] - relationship map
 * @param {Object} [includeObj] - include object
 * @returns {Object} - JSON-Api Object
 */
export function jsonToJsonApi(jsonObject, type, relationshipMap, includeObj) {

  //Build JSON API structure
  let jsonApiBody;
  if (Ember.isArray(jsonObject)) {
    jsonApiBody = jsonObject.map(_.partial(buildJsonApiDataObj, _, type, relationshipMap));
  } else {
    jsonApiBody = buildJsonApiDataObj(jsonObject, type, relationshipMap);
  }

  let jsonApiObj = {
    data: jsonApiBody
  };

  if (includeObj) {
    jsonApiObj.included = buildJsonApiIncludedArray(includeObj, relationshipMap);
  }

  return jsonApiObj;
}

/**
 * Extracts JSON-API relations from the given JSON object
 *
 * @function mapRelations
 * @param {Object} jsonObject - JSON object
 * @param {Object} relationshipMap - relationship map in the form {jsonProperty: {type: jsonApiType, dataAsObject: true}, ...}
 * @returns {Object} - JSON-API relationship object
 */
export function mapRelations(jsonObject, relationshipMap) {

  let relationships = {};

  relationshipMap.forEach(relationship => {
    let jsonProperty = relationship.property,
        relIDs = Ember.makeArray(jsonObject[jsonProperty]),
        relData = relIDs.map((id) => {
          return {
            id,
            type: relationship.type
          };
        });

        // valid relations is hasOne, hasMany. Default: hasMany
    if (relationship.relation === 'hasOne') {
      relData = relData[0];
    }

    relationships[jsonProperty] = {
      data: relData
    };
  });

  return relationships;
}
