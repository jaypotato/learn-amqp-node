declare global {
    namespace NodeJS {
      interface ProcessEnv {
        PORT?: string;
        EMAIL_SERVICE?: string;
        BIRTHDAY_REMINDER_SCHEDULE?: string;
      }
    }
  }

  export {}