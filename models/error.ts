/** 커스텀 에러클래스 - 메세지와, errorCode를 넣으면 작동한다 */
export default class HttpError extends Error {
  code: number;
  constructor(message: string, errorCode: number) {
    super(message);
    this.code = errorCode;
  }
}
