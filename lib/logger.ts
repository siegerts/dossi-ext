class Logger {
  private prefix: string

  constructor(prefix: string) {
    this.prefix = prefix
  }

  public log(message: string): void {
    console.log(`[${this.prefix}]: ${message}`)
  }

  public error(message: string): void {
    console.error(`[${this.prefix} ERROR]: ${message}`)
  }

  public info(message: string): void {
    console.info(`[${this.prefix} INFO]: ${message}`)
  }

  public warn(message: string): void {
    console.warn(`[${this.prefix} WARNING]: ${message}`)
  }
}

export default Logger
