'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var tonalArray = require('tonal-array');
var Note = require('tonal-note');
var tonalInterval = require('tonal-interval');
var Distance = require('tonal-distance');
var Dictionary = require('tonal-dictionary');
var tonalScale = require('tonal-scale');
var tonalChord = require('tonal-chord');
var tonalPcset = require('tonal-pcset');

/**
 * [![npm version](https://img.shields.io/npm/v/tonal-key.svg?style=flat-square)](https://www.npmjs.com/package/tonal-key)
 *
 * The `Tonal` module is a facade to the rest of the modules. They are namespaced,
 * so for example to use `pc` function from `tonal-note` you have to write:
 * `Tonal.Note.pc`
 *
 * It exports the following modules:
 * - Note
 * - Interval
 * - Distance
 * - Scale
 * - Chord
 * - PcSet
 *
 * Additionally this facade exports some functions without namespace (see "Methods" below)
 *
 * @example
 * // es6 modules
 * import * as Tonal from "tonal"
 * Tonal.Note.name("cx") // => "C##"
 *
 * @example
 * import { Note } from "tonal"
 * Note.name("bb") // => "Bb"
 *
 * @example
 * // es5 node modules
 * var Tonal = require("tonal");
 * Tonal.Distance.transpose(Tonal.Note.pc("C#2"), "M3") // => "E#"
 * Tonal.Chord.notes("Dmaj7") // => ["D", "F#", "A", "C#"]
 *
 * @module Tonal
 */
/**
 * Transpose a note by an interval
 * @function
 * @param {String} note
 * @param {String} interval
 * @return {String} the transported note
 * @see Distance.transpose
 */
var transpose$1 = Distance.transpose;

/**
 * Get the interval from two notes
 * @function
 * @param {String} from
 * @param {String} to
 * @return {String} the interval in reverse shorthand notation
 * @see Distance.interval
 */
var interval$1 = Distance.interval;

/**
 * Get note properties
 * @function
 * @param {String} note - the note name
 * @return {Object}
 * @see Note.props
 * @example
 * Tonal.note("A4").chroma // => 9
 */
var note = Note.props;

/**
 * Get midi note number
 * @function
 * @param {String} note
 * @return {Number}
 * @see Note.midi
 * @example
 * Tonal.midi("A4") // => 49
 */
var midi$1 = Note.midi;

/**
 * Get note frequency using equal tempered tuning at 440
 * @function
 * @param {String} note
 * @return {Number}
 * @see Note.freq
 * @example
 * Tonal.freq("A4") // => 440
 */
var freq$1 = Note.freq;

/**
 * Get intervals from a chord type
 * @function
 * @param {String} type - the chord type (no tonic)
 * @return {Array} an array of intervals or undefined if the chord type is not known
 * @see Dictionary.chord
 * @example
 * Tonal.chord("m7b5") // => ["1P", "3m", "5d", "7m"]
 */
var chord$1 = Dictionary.chord;

/**
 * Get intervals from scale name
 * @function
 * @param {String} name - the scale name (without tonic)
 * @return {Array} an array of intervals or undefiend if the scale is not kown
 * @example
 * Tonal.scale("major") // => ["1P", "2M", "3M"...]
 */
var scale$1 = Dictionary.scale;

exports.Array = tonalArray;
exports.Note = Note;
exports.Interval = tonalInterval;
exports.Distance = Distance;
exports.Scale = tonalScale;
exports.Chord = tonalChord;
exports.PcSet = tonalPcset;
exports.Dictionary = Dictionary;
exports.transpose = transpose$1;
exports.interval = interval$1;
exports.note = note;
exports.midi = midi$1;
exports.freq = freq$1;
exports.chord = chord$1;
exports.scale = scale$1;
