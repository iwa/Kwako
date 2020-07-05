/**
 * Image generation function
 * @packageDocumentation
 * @module ImGenerator
 * @category Utils
 */
import { createCanvas, loadImage, CanvasRenderingContext2D, registerFont } from 'canvas';
import { MessageAttachment } from 'discord.js';

registerFont('assets/Nunito-SemiBold.ttf', { family: "Nunito" });

/**
 * @param width - Width of the screenshot (in pixels)
 * @param height - Height of the screenshot (in pixels)
 * @param content - HTML content, written in one string
 * @param tag - UID of the user
 * @param prefix - Prefix to define the type of image generated
 * @returns Link to the generated file
 */
export default async function imGenerator(user: any) {
    const canvas = createCanvas(1016, 336)
    const ctx = canvas.getContext('2d')

    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, 1016, 336)

    var grd = ctx.createLinearGradient(0, 0, 1016, 336);
    grd.addColorStop(0, `${user.userColor}A6`);
    grd.addColorStop(1, `${user.userColor}`);

    ctx.fillStyle = grd;
    ctx.fillRect(8, 8, 1000, 320);

    ctx.fillStyle = 'rgba(0, 0, 0, 0.15)'
    ctx.fillRect(28, 28, 960, 280)

    // username
    let username = user.username;
    if(user.username.length > 15) {
        username = `${user.username.slice(0, 14)}...`;
    }

    ctx.font = 'bold 56pt Nunito'
    ctx.textAlign = 'left'
    ctx.fillStyle = '#fff'
    ctx.fillText(username, 328, 158)

    // level
    let level = `Level ${user.level}`
    ctx.font = '300 34pt Nunito'
    ctx.textAlign = 'left'
    ctx.fillStyle = '#fff'
    ctx.fillText(level, 338, 270)

    // rank
    let rank = `#${user.positionExp} | ${user.current}/${user.max}`
    ctx.font = '300 24pt Nunito'
    ctx.textAlign = 'right'
    ctx.fillStyle = 'rgba(255, 255, 255, 0.75)'
    ctx.fillText(rank, 964, 270)

    // pfp
    await make_base(ctx, user.avatar);

    // contour progress bar
    ctx.save();
    makeRund(ctx, 326, 278, 650, 19, 10);

    ctx.clip();

    ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
    ctx.fillRect(326, 278, 650, 19);

    ctx.restore();

    // progress bar
    ctx.save();
    makeRund(ctx, 328, 280, 646, 15, 8);

    ctx.clip();
    ctx.fillStyle = "rgba(22, 22, 22, 0.8)";
    ctx.fillRect(328, 280, 646, 15);

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(328, 280, user.expBar, 15);
    var grad = ctx.createLinearGradient(0, 0, 1516, 0);
    grad.addColorStop(0, "transparent");
    grad.addColorStop(1, "rgba(0,0,0,0.4)");
    ctx.fillStyle = grad;
    ctx.fillRect(328, 280, user.expBar, 15);

    ctx.restore();

    return new MessageAttachment(canvas.toBuffer('image/jpeg', {quality: 1}), 'rank.jpg')
}

async function make_base(ctx: CanvasRenderingContext2D, url: string) {
    let base_image = await loadImage(url)
    ctx.save();
    makeRund(ctx, 28, 28, 280, 280, 140);
    ctx.clip();
    ctx.drawImage(base_image, 28, 28, 280, 280);
    ctx.restore();
}

function makeRund(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
}
