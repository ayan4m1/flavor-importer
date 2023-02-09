import { Container, format, transports } from 'winston';

const { combine, label, prettyPrint, printf } = format;

const loggers = {};
const container = new Container();

const createLogger = (category, categoryLabel) => {
  const formatter = (data) => `[${data.level}][${data.label}] ${data.message}`;
  const formatters = [label({ label: categoryLabel })];

  formatters.push(prettyPrint(), printf(formatter));
  container.add(category, {
    transports: [
      new transports.Console({
        level: process.env.LOG_LEVEL || 'info',
        format: combine.apply(null, formatters)
      })
    ]
  });

  return container.get(category);
};

export default (category, categoryLabel = category) => {
  if (!loggers[category]) {
    loggers[category] = createLogger(category, categoryLabel);
  }

  return loggers[category];
};
