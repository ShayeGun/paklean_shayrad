const checkEnvVar = (...args: string[]) => {
    for (let i = 0; i < args.length; i++) {
        if (!process.env[args[i]]) throw new Error(`no ${args[i]} env variable is available`)
    }
}

export { checkEnvVar }