import { createCanvas, loadImage, CanvasRenderingContext2D, registerFont } from 'canvas';
import { MessageAttachment } from 'discord.js';

registerFont('assets/Nunito-SemiBold.ttf', { family: "Nunito" });

export default async function imGeneratorPremium(user: any) {
    const canvas = createCanvas(1016, 356)
    const ctx = canvas.getContext('2d')

    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, 1016, 356)

    if(!user.userBackground) {
        let grd = ctx.createLinearGradient(0, 0, 1016, 356);
        grd.addColorStop(0, `${user.userColor}A6`);
        grd.addColorStop(1, `${user.userColor}`);

        ctx.fillStyle = grd;
        ctx.fillRect(0, 0, 1016, 356);

        ctx.save();
        makeRund(ctx, 20, 20, 976, 316, 10);

        ctx.clip();

        ctx.fillStyle = 'rgba(50, 50, 50, 0.08)'
        ctx.fillRect(20, 20, 976, 316)

        ctx.restore();
    } else {
        let base_image = await loadImage(user.userBackground.url)
        if(base_image) {
            ctx.drawImage(base_image,
                Math.ceil((base_image.width - user.userBackground.width)/2),
                Math.ceil((base_image.height - user.userBackground.height)/2),
                user.userBackground.width,
                user.userBackground.height,
                0, 0, 1016, 356);

            ctx.save();
            makeRund(ctx, 20, 20, 976, 316, 10);

            ctx.clip();

            ctx.fillStyle = 'rgba(50, 50, 50, 0.43)'
            ctx.fillRect(20, 20, 976, 316)

            ctx.restore();
        } else {
            let grd = ctx.createLinearGradient(0, 0, 1016, 356);
            grd.addColorStop(0, `${user.userColor}A6`);
            grd.addColorStop(1, `${user.userColor}`);

            ctx.fillStyle = grd;
            ctx.fillRect(0, 0, 1016, 356);

            ctx.save();
            makeRund(ctx, 20, 20, 976, 316, 10);

            ctx.clip();

            ctx.fillStyle = 'rgba(50, 50, 50, 0.1)'
            ctx.fillRect(20, 20, 976, 316)

            ctx.restore();
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

    ctx.save();

    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 3;
    ctx.shadowColor = "rgba(0, 0, 0, 0.3)";
    ctx.shadowBlur = 4;

    ctx.fillText(username, 328, 154)

    ctx.restore()


    // level
    let level = `Level ${user.level}`
    ctx.font = '300 34pt Nunito'
    ctx.textAlign = 'left'
    ctx.fillStyle = '#fff'

    ctx.save();

    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 2;
    ctx.shadowColor = "rgba(0, 0, 0, 0.2)";
    ctx.shadowBlur = 4;

    ctx.fillText(level, 328, 250)

    ctx.restore();

    // rank
    let rank = `#${user.positionExp} | ${user.current}/${user.max}`
    ctx.font = '300 24pt Nunito'
    ctx.textAlign = 'right'
    ctx.fillStyle = 'rgba(255, 255, 255, 0.75)'

    ctx.save();

    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 1;
    ctx.shadowColor = "rgba(0, 0, 0, 0.2)";
    ctx.shadowBlur = 4;

    ctx.fillText(rank, 974, 250)

    ctx.restore();

    // pfp
    await make_base(ctx, user.avatar);

    // premium icon
    if(user.premium && !user.iwa) {
        let premium_icon = await loadImage("https://cdn.iwa.sh/img/star.png")
        ctx.save();

        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        ctx.shadowColor = "rgba(0, 0, 0, 0.15)";
        ctx.shadowBlur = 4;

        ctx.drawImage(premium_icon, 258, 54, 40, 40);
        ctx.restore();
    } else if (user.iwa) {
        let premium_icon = await loadImage("https://cdn.iwa.sh/img/tools.png")
        ctx.save();

        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        ctx.shadowColor = "rgba(0, 0, 0, 0.15)";
        ctx.shadowBlur = 4;

        ctx.drawImage(premium_icon, 258, 54, 40, 40);
        ctx.restore();
    }

    // progress bar
    ctx.save();
    makeRund(ctx, 328, 260, 646, 15, 8);

    ctx.clip();
    ctx.fillStyle = "rgba(22, 22, 22, 0.8)";
    ctx.fillRect(328, 260, 646, 15);

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(328, 260, user.expBar, 15);
    var grad = ctx.createLinearGradient(0, 0, 1516, 0);
    grad.addColorStop(0, "transparent");
    grad.addColorStop(1, "rgba(0,0,0,0.4)");
    ctx.fillStyle = grad;
    ctx.fillRect(328, 260, user.expBar, 15);

    ctx.restore();

    // birthday icon
    let cake_image = await loadImage("https://cdn.iwa.sh/img/cake.png")
    ctx.save();

    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 1;
    ctx.shadowColor = "rgba(0, 0, 0, 0.2)";
    ctx.shadowBlur = 4;

    ctx.drawImage(cake_image, 168, 295, 34, 34);
    ctx.restore();

    // birthday
    let birthday = `${user.birthday}`
    ctx.font = '300 24pt Nunito'
    ctx.textAlign = 'left'
    ctx.fillStyle = 'rgba(255, 255, 255, 0.75)'

    ctx.save();

    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 1;
    ctx.shadowColor = "rgba(0, 0, 0, 0.2)";
    ctx.shadowBlur = 4;

    ctx.fillText(birthday, 212, 324)

    // birthday format
    let birthdayFormat = "(dd/mm)"
    ctx.font = '300 14pt Nunito'
    ctx.textAlign = 'left'
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)'
    ctx.fillText(birthdayFormat, 302, 322)

    ctx.restore()

    // switch icon
    let switch_image = await loadImage("https://cdn.iwa.sh/img/switch.png")
    ctx.save();

    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 1;
    ctx.shadowColor = "rgba(0, 0, 0, 0.2)";
    ctx.shadowBlur = 4;

    ctx.drawImage(switch_image, 592, 299, 26, 26);
    ctx.restore();

    // switch fc
    let fc = `${user.fc}`
    ctx.font = '300 24pt Nunito'
    ctx.textAlign = 'left'
    ctx.fillStyle = 'rgba(255, 255, 255, 0.75)'

    ctx.save();

    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 1;
    ctx.shadowColor = "rgba(0, 0, 0, 0.2)";
    ctx.shadowBlur = 4;

    ctx.fillText(fc, 628, 324)

    ctx.restore();

    // made with love
    let made = `made with ♥ by iwa`
    ctx.font = '300 12pt Nunito'
    ctx.textAlign = 'center'
    ctx.fillStyle = 'rgba(255, 255, 255, 0.05)'
    ctx.fillText(made, 488, 354)

    return new MessageAttachment(canvas.toBuffer('image/png'), 'rank.png');
}

async function make_base(ctx: CanvasRenderingContext2D, url: string) {
    let base_image = await loadImage(url)
    ctx.save();
    makeRund(ctx, 38, 28, 260, 260, 130);
    ctx.clip();
    ctx.drawImage(base_image, 38, 28, 260, 260);
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
