import nodeMailer from "nodemailer";
import config from "../config/vars";
import createEmailTemplate from "./createEmailTemplate";

interface ISendEmail {
  emailFrom: string;
  emailTo: string;
  subject: string;
  fileSize: string;
  text: string;
  filename: string;
  downloadPageLink: string;
}
const sendEmail = async ({
  emailFrom,
  emailTo,
  subject,
  filename,
  fileSize,
  downloadPageLink,
}: ISendEmail) => {
  const transporter = nodeMailer.createTransport({
    //@ts-ignore
    service: config.SENDINBLUE_SMTP_SERVICE,
    host: config.SENDINBLUE_SMTP_HOST,
    port: config.SENDINBLUE_SMTP_PORT,
    secure: false,
    auth: {
      user: config.SENDINBLUE_SMTP_USER,
      pass: config.SENDINBLUE_SMTP_PASSWORD,
    },
  });

  const mailOptions = {
    from: emailFrom,
    to: emailTo,
    subject,
    text: `${emailFrom} shared a file with you`,
    html: createEmailTemplate(emailFrom, downloadPageLink, filename, fileSize),
  };
  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (err) {
    console.log(err);
    return false;
  }
};
export default sendEmail;
