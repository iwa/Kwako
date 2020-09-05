import { createCanvas, loadImage, CanvasRenderingContext2D, registerFont } from 'canvas';
import { MessageAttachment } from 'discord.js';

registerFont('assets/Nunito-SemiBold.ttf', { family: "Nunito" });

export default async function imGenerator(user: any) {
    const canvas = createCanvas(1016, 336)
    const ctx = canvas.getContext('2d')

    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, 1016, 336)

    if(!user.userBackground) {
        let grd = ctx.createLinearGradient(0, 0, 1016, 336);
        grd.addColorStop(0, `${user.userColor}A6`);
        grd.addColorStop(1, `${user.userColor}`);

        ctx.fillStyle = grd;
        ctx.fillRect(8, 8, 1000, 320);

        ctx.fillStyle = 'rgba(0, 0, 0, 0.15)'
        ctx.fillRect(28, 28, 960, 280)
    } else {
        let base_image = await loadImage(user.userBackground.url)
        if(base_image) {
            ctx.drawImage(base_image,
                Math.ceil((base_image.width - user.userBackground.width)/2),
                Math.ceil((base_image.height - user.userBackground.height)/2),
                user.userBackground.width,
                user.userBackground.height,
                8, 8, 1000, 320);

            ctx.fillStyle = 'rgba(0, 0, 0, 0.3)'
            ctx.fillRect(28, 28, 960, 280)
        } else {
            let grd = ctx.createLinearGradient(0, 0, 1016, 336);
            grd.addColorStop(0, `${user.userColor}A6`);
            grd.addColorStop(1, `${user.userColor}`);

            ctx.fillStyle = grd;
            ctx.fillRect(8, 8, 1000, 320);

            ctx.fillStyle = 'rgba(0, 0, 0, 0.15)'
            ctx.fillRect(28, 28, 960, 280)
        }
    }

    // username
    let username = user.username;
    if(user.username.length > 13) {
        username = `${user.username.slice(0, 12)}...`;
    }

    ctx.font = 'bold 56pt Nunito'
    ctx.textAlign = 'left'
    ctx.fillStyle = '#fff'
    ctx.fillText(username, 328, 148)

    // level
    let level = `Level ${user.level}`
    ctx.font = '300 34pt Nunito'
    ctx.textAlign = 'left'
    ctx.fillStyle = '#fff'
    ctx.fillText(level, 338, 240)

    // rank
    let rank = `#${user.positionExp} | ${user.current}/${user.max}`
    ctx.font = '300 24pt Nunito'
    ctx.textAlign = 'right'
    ctx.fillStyle = 'rgba(255, 255, 255, 0.75)'
    ctx.fillText(rank, 964, 240)

    // pfp
    await make_base(ctx, user.avatar);

    // contour progress bar
    ctx.save();
    makeRund(ctx, 326, 248, 650, 19, 10);

    ctx.clip();

    ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
    ctx.fillRect(326, 248, 650, 19);

    ctx.restore();

    // progress bar
    ctx.save();
    makeRund(ctx, 328, 250, 646, 15, 8);

    ctx.clip();
    ctx.fillStyle = "rgba(22, 22, 22, 0.8)";
    ctx.fillRect(328, 250, 646, 15);

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(328, 250, user.expBar, 15);
    var grad = ctx.createLinearGradient(0, 0, 1516, 0);
    grad.addColorStop(0, "transparent");
    grad.addColorStop(1, "rgba(0,0,0,0.4)");
    ctx.fillStyle = grad;
    ctx.fillRect(328, 250, user.expBar, 15);

    ctx.restore();

    // birthday icon
    let cake_image = await loadImage("https://cdn.iwa.sh/img/cake.png")
    ctx.save();
    ctx.drawImage(cake_image, 338, 270, 34, 34);
    ctx.restore();

    // birthday
    let birthday = `${user.birthday}`
    ctx.font = '300 24pt Nunito'
    ctx.textAlign = 'left'
    ctx.fillStyle = 'rgba(255, 255, 255, 0.65)'
    ctx.fillText(birthday, 382, 299)

    // birthday format
    let birthdayFormat = "(mm/dd)"
    ctx.font = '300 14pt Nunito'
    ctx.textAlign = 'left'
    ctx.fillStyle = 'rgba(255, 255, 255, 0.55)'
    ctx.fillText(birthdayFormat, 472, 297)

    // switch icon
    let switch_image = await loadImage("https://cdn.iwa.sh/img/switch.png")
    ctx.save();
    ctx.drawImage(switch_image, 658, 272, 30, 30);
    ctx.restore();

    // switch
    let fc = `${user.fc}`
    ctx.font = '300 24pt Nunito'
    ctx.textAlign = 'left'
    ctx.fillStyle = 'rgba(255, 255, 255, 0.65)'
    ctx.fillText(fc, 698, 298)

    // made with love
    let made = `made with ♥ by iwa`
    ctx.font = '300 12pt Nunito'
    ctx.textAlign = 'center'
    ctx.fillStyle = 'rgba(255, 255, 255, 0.05)'
    ctx.fillText(made, 488, 324)

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
