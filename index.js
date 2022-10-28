const fs = require('fs');

const PDFDocument = require('pdfkit');
const date = require('date-and-time');
const { stroke } = require('pdfkit');

// Set the year this planner is for here
const PLANNER_YEAR = 2023;

const doc = new PDFDocument({size: 'LETTER', autoFirstPage: false});
doc.pipe(fs.createWriteStream('out.pdf'));

function boxWithText(doc, x, y, width, height, text, fill = '#e3e3e3', color = 'black') {
  doc.rect(x, y, width, height)
     .fillAndStroke(fill, color)
     .fillColor(color)
     .text(text, x + 5, 1 + y + height/2, {
        baseline: 'middle', width
      });
  }

function boxWithCircles(doc, x, y, width, height, count, columns = 1, color = 'black') {
  let yOffset = height / (count + 1);
  doc.rect(x, y, width, height);

  let xOffset = width / columns;

  const totalCircleHeight = count * 10;
  const emptyVerticalSpace = height - totalCircleHeight;
  y += emptyVerticalSpace / (count * 2) + 5;
  yOffset = emptyVerticalSpace / count + 10;

  for (c = 0; c < columns; c++) {
    for (let i = 0; i < count; i++) {
       doc.circle(x + 10 + c * xOffset, y + i * yOffset, 5);
    }
  }

  doc.stroke(color);
}

function boxWithTime(doc, x, y, width, height, time, color = 'black') {
  let h = doc.heightOfString(time);
  let w = doc.widthOfString('7\nam');
  doc.rect(x, y, width, height)
    .stroke('#999999')
    .fillColor('#444444')
    .text(time, x + 2, y + 2 + (height - h) / 2, { width: w, align: 'center' });
}

function boxWithTopText(doc, x, y, width, height, text, fill = '#e3e3e3', color = '#444444') {
  doc.rect(x, y, width, height)
     .fillAndStroke(fill, color)
     .fillColor(color)
     .text(text, x + 5, y + 5, { baseline: 'top' });
}

function getTimeString(hour) {
  if (hour < 12) return `${hour}\nam`;
  else if (hour == 12) return '12\npm';
  return `${hour - 12}\npm`;
};

function boxWithTimes(doc, y, xs) {
  const startY = y;
  for (let h = 7; h <= 21; h++) {
    const time = getTimeString(h);
    for (let x of xs) {
      boxWithTime(doc, x, y, colWidth, 35, time);
    }
    y += 35;
  }

  for (let x of xs) {
    doc.rect(x, startY, colWidth, y - startY).stroke('black');
  }
  return y;
}

const PAGE_WIDTH = 612;
const PAGE_HEIGHT = 792;
const xMargin = 40;
const CONTENT_WIDTH = PAGE_WIDTH - xMargin * 2;
const yMargin = 20;
const x = xMargin;
let colWidth = (612 - xMargin * 2) / 3;
const x1 = x;
const x2 = x + colWidth;
const x3 = x + 2 * colWidth;

function WeekLeftPage(doc, current) {
  let y = yMargin;
  doc.addPage();
  doc.lineWidth(0.5);
  doc.rect(xMargin, yMargin, 612 - xMargin * 2, 792 - yMargin * 2).stroke();
  doc.fontSize(14);
  doc.font('Times-Bold');
  boxWithText(doc, x1, y, colWidth, 25, date.format(current, 'ddd • MMM D').toUpperCase());
  boxWithText(doc, x2, y, colWidth, 25, date.format(date.addDays(current, 1), 'ddd • MMM D').toUpperCase());
  boxWithText(doc, x3, y, colWidth, 25, date.format(date.addDays(current, 2), 'ddd • MMM D').toUpperCase());
  y += 25;

  doc.fontSize(12);
  doc.font('Times-Roman');

  boxWithCircles(doc, x1, y, colWidth, 60, 3);
  boxWithCircles(doc, x2, y, colWidth, 60, 3);
  boxWithCircles(doc, x3, y, colWidth, 60, 3);
  y += 60;

  y = boxWithTimes(doc, y, [ x1, x2, x3 ]);

  boxWithTopText(doc, x1, y, colWidth, 50, 'Dinner');
  boxWithTopText(doc, x2, y, colWidth, 50, 'Dinner');
  boxWithTopText(doc, x3, y, colWidth, 50, 'Dinner');
  y += 50;

  boxWithCircles(doc, x1, y, colWidth * 3, 792 - yMargin - y, 4, 2);
}

function WeekRightPage(doc, current) {
  let y = yMargin;
  doc.addPage();
  doc.lineWidth(0.5);
  doc.rect(xMargin, yMargin, 612 - xMargin * 2, 792 - yMargin * 2).stroke();
  doc.fontSize(14);
  doc.font('Times-Bold');
  boxWithText(doc, x1, y, colWidth, 25, date.format(current, 'ddd • MMM D').toUpperCase());
  boxWithText(doc, x2, y, colWidth, 25, date.format(date.addDays(current, 1), 'ddd • MMM D').toUpperCase());
  y += 25;

  doc.fontSize(12);
  doc.font('Times-Roman');

  boxWithCircles(doc, x1, y, colWidth, 60, 3);
  boxWithCircles(doc, x2, y, colWidth, 60, 3);
  y += 60;

  y = boxWithTimes(doc, y, [x1, x2]);

  boxWithTopText(doc, x1, y, colWidth, 50, 'Dinner');
  boxWithTopText(doc, x2, y, colWidth, 50, 'Dinner');
  y += 50;
  const bottomBoxTop = y;
  boxWithCircles(doc, x1, y, colWidth * 3, 792 - yMargin - y, 4, 2);

  // weekend column
  y = yMargin;
  doc.fontSize(14);
  doc.font('Times-Bold');
  const boxHeight = 81;
  boxWithText(doc, x3, y, colWidth, 25, date.format(date.addDays(current, 2), 'ddd • MMM D').toUpperCase());
  doc.fontSize(12);
  doc.font('Times-Roman');
  y += 25;
  boxWithCircles(doc, x3, y, colWidth, 60, 3);
  y += 60;
  boxWithTopText(doc, x3, y, colWidth, boxHeight, 'Morning', 'white');
  y += boxHeight;
  boxWithTopText(doc, x3, y, colWidth, boxHeight, 'Afternoon', 'white');
  y += boxHeight;
  boxWithTopText(doc, x3, y, colWidth, boxHeight, 'Evening', 'white');
  y += boxHeight;

  doc.fontSize(14);
  doc.font('Times-Bold');
  boxWithText(doc, x3, y, colWidth, 25, date.format(date.addDays(current, 3), 'ddd • MMM D').toUpperCase());
  doc.fontSize(12);
  doc.font('Times-Roman');
  y += 25;
  boxWithCircles(doc, x3, y, colWidth, 60, 3);
  y += 60;
  boxWithTopText(doc, x3, y, colWidth, boxHeight, 'Morning', 'white');
  y += boxHeight;
  boxWithTopText(doc, x3, y, colWidth, boxHeight, 'Afternoon', 'white');
  y += boxHeight;
  boxWithTopText(doc, x3, y, colWidth, bottomBoxTop - y, 'Evening', 'white');

}

function MonthPageLeft(doc, current) {
  doc.addPage();

  const currentMonth = current.getMonth();
  current = date.addDays(current, -current.getDate() + 1);

  doc.lineWidth(0.5);
  y = yMargin;
  doc.fontSize(40);
  doc.font('Helvetica-Bold');
  const month = date.format(current, 'MMMM').toUpperCase();
  doc.text(month, xMargin, y, { width: PAGE_WIDTH - xMargin * 2, baseline: 'top', align: 'center' });
  y += doc.heightOfString(month) - 10;

  doc.fontSize(20);
  const year = date.format(current, 'YYYY').toUpperCase();
  doc.fillColor('#666666');
  doc.text(year, xMargin, y, { width: PAGE_WIDTH - xMargin * 2, baseline: 'top', align: 'center' });
  y += doc.heightOfString(year);

  const DAYS = [ 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday' ];
  const dayWidth = (PAGE_WIDTH - xMargin * 2) / DAYS.length;
  doc.font('Helvetica');
  doc.fontSize(12);
  for (let i = 0; i < DAYS.length; i++) {
    boxWithText(doc, xMargin + i * dayWidth, y, dayWidth, 20, DAYS[i]);
  }
  y += 20;

  const firstDay = date.format(current, 'dddd');
  const firstDayIndex = DAYS.indexOf(firstDay);
  const dayHeight = 35;

  for (let i = 0; i < firstDayIndex; i++) {
    boxWithText(doc, xMargin + i * dayWidth, y, dayWidth, dayHeight, '', 'white');
  }

  for (let i = firstDayIndex; i < DAYS.length; i++) {
    boxWithTopText(doc, xMargin + i * dayWidth, y, dayWidth, dayHeight, date.format(current, 'D'), 'white');
    current = date.addDays(current, 1);
  }
  y += dayHeight;

  while (current.getMonth() == currentMonth) {
    for (let i = 0; i < DAYS.length; i++) {
      const t = current.getMonth() === currentMonth ? date.format(current, 'D') : '';
      boxWithTopText(doc, xMargin + i * dayWidth, y, dayWidth, dayHeight, t, 'white');
      current = date.addDays(current, 1);
    }
    y += dayHeight;
  }

  // make a margin
  y += yMargin;
  doc.rect(xMargin, y, CONTENT_WIDTH, PAGE_HEIGHT - yMargin - y).stroke('black');

  doc.fontSize(25);
  doc.font('Times-Bold');
  const BRAIN_DUMP = 'Monthly Goals';
  const bd_width = doc.widthOfString(BRAIN_DUMP);
  const bd_height = doc.heightOfString(BRAIN_DUMP);
  const bd_x = (PAGE_WIDTH - bd_width) / 2;
  doc.rect(bd_x - 10, y - 1, bd_width + 20, 2).fill('white');
  doc.fillColor('black');
  doc.text(BRAIN_DUMP, bd_x, y, { baseline: 'middle' });
}

function WeeklyPrep(doc) {
  doc.addPage();
  doc.lineWidth(0.5);

  let y = yMargin;

  doc.fontSize(25);
  doc.font('Times-Bold');
  const TEXT = 'Weekly Prep';
  const text_width = doc.widthOfString(TEXT);
  const text_height = doc.heightOfString(TEXT);

  y += text_height / 2;

  const text_x = (PAGE_WIDTH - text_width) / 2;

  doc.rect(xMargin, y, CONTENT_WIDTH, PAGE_HEIGHT - yMargin - y).stroke('black');

  doc.rect(text_x - 10, y - 1, text_width + 20, 2).fill('white');
  doc.fillColor('black');
  doc.text(TEXT, text_x, y, { baseline: 'middle' });
}

function LinedPage(doc) {
  doc.addPage()
  doc.lineWidth(0.5);
  const LINE_HEIGHT = 25;
  let y = yMargin + LINE_HEIGHT;

  while (y < PAGE_HEIGHT - yMargin) {
    doc.moveTo(xMargin, y).lineTo(PAGE_WIDTH - xMargin, y).stroke('black');
    y += LINE_HEIGHT;
  }
}

function titlePage(doc, year) {
  doc.addPage();

  doc.fontSize(50);
  doc.font('Times-Bold');

  doc.text('Weekly Planner', { align: 'center' });
  doc.text(year, { align: 'center' });
}

// find the Monday prior to the start of the year
// (unless the year starts on a Monday)
let current = date.parse(`1/1/${PLANNER_YEAR}`, 'M/D/YYYY');
current = date.addDays(current, -(current.getDay() + 6) % 7);

let currentMonth = current.getMonth();

titlePage(doc, PLANNER_YEAR);

while (current.getFullYear() <= PLANNER_YEAR) {

  // add 3 days to current monday, so that
  // month starts monday through thursday do month pages
  // month starts friday through saturday do week pages
  const checkDay = date.addDays(current, 3);
  if (checkDay.getMonth() !== currentMonth) {
    MonthPageLeft(doc, checkDay);
    WeeklyPrep(doc);
    currentMonth = checkDay.getMonth();
  } else {
    WeeklyPrep(doc);
    LinedPage(doc);
  }

  WeekLeftPage(doc, current);

  current = date.addDays(current, 3);
  WeekRightPage(doc, current);

  current = date.addDays(current, 4);
}

doc.end();
