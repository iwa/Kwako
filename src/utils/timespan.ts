/**
 * Fork of the 'timespan-parser' package
 * original author: gilly3
 */

import assert from "assert";
import { Message } from "discord.js";

const ms = 1;
const s = 1000 * ms;
const m = 60 * s;
const h = 60 * m;
const d = 24 * h;
const w = 7 * d;
const M = 30.44 * d;
const y = 365.25 * d;

const UNITS: any = {
    msec: ms,
    ms,
    seconds: s,
    second: s,
    sec: s,
    "": s,
    s,
    minutes: m,
    minute: m,
    min: m,
    m,
    hours: h,
    hour: h,
    hr: h,
    h,
    days: d,
    day: d,
    d,
    weeks: w,
    week: w,
    w,
    months: M,
    month: M,
    M,
    years: y,
    year: y,
    y
};

function init(defaultUnit: string | number) {
    const units = Object.assign({}, UNITS);

    assert.strictEqual(typeof defaultUnit, "string", `Invalid unit, expected string but got ${typeof defaultUnit}`);
    const val = units[defaultUnit];
    assert.ok(val, `Unknown unit ${defaultUnit}`);
    units[""] = val;

    return {
        parse,
        getString
    };

    async function parse(timespan: string, unit: string, msg: Message) {
        if(!timespan)
            return msg.channel.send('Expected timespan');

        if(typeof timespan !== 'string')
            return msg.channel.send(`Invalid timespan, expected string but got ${typeof timespan}`);

        if (unit == null)
            unit = "";

        if(typeof unit !== 'string')
            return msg.channel.send(`Invalid unit, expected string but got ${typeof unit}`)

        const divider = units[unit];
        if(!divider)
            return msg.channel.send(`Unknown unit ${unit}`);
        //assert.ok(divider, `Unknown unit ${unit}`);

        const tss = /^\s*-?(\d+\s*[a-z]*\s*)+$/.test(timespan) && timespan.match(/\d+\s*[a-z]*\s*/g);

        if(!tss)
            return msg.channel.send(`Invalid format for timespan ${timespan}`);
        //assert.ok(tss, msg.channel.send(`Invalid format for timespan ${timespan}`));

        const sign = timespan.trim().startsWith("-") ? -1 : 1;
        const value = tss.reduce((sum, ts) => sum + getValue(ts), 0);
        return sign * (value / divider);
    }

    function getValue(ts: string) {
        const n = parseInt(ts, 10);
        const suf = ts.replace(/[\d\s-]/g, "");
        const mutliplier = units[suf];
        assert.ok(mutliplier, `Invalid timespan, unknown unit ${suf}`);
        return n * mutliplier;
    }

    function getString(value: number, unit: string, msg: Message) {
        if(!isFinite(value))
            return msg.channel.send(`Invalid value ${value}`);

        if (unit == null)
            unit = "";

        if(typeof unit !== 'string')
            return msg.channel.send(`Invalid unit, expected string but got ${typeof unit}`);

        if(!units[unit] || units[unit] === 0 || units[unit] === false)
            return msg.channel.send(`Unknown unit ${unit}`);

        const tss: any[] = [];
        const sign = value < 0 ? "-" : "";
        value = Math.abs(Math.round(value * units[unit]));
        const writeValue = (unitName: string) => {
            const unitVal = units[unitName];
            if (value >= unitVal) {
                tss.push(Math.floor(value / unitVal) + unitName);
                value %= unitVal;
            }
        };
        writeValue("y");
        writeValue("w");
        writeValue("d");
        writeValue("h");
        writeValue("m");
        writeValue("s");
        writeValue("ms");
        return sign + tss.join(" ");
    }
}

export default Object.assign(init, init('min'));
