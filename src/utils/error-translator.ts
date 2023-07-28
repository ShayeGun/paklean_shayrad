import { CustomError } from "./custom-error";

export const errorTranslator = (err: any, conditionsArr: { errStatus: number, msg: string, resStatus: number }[]) => {
    if (err.name !== "AxiosError") return err;

    const e = err.message.split(" ");
    const status = Number(e[e.length - 1]);

    for (let condition of conditionsArr) {
        if (status === condition.errStatus) return new CustomError(condition.msg, condition.errStatus, condition.resStatus);
    }

    return err;
}