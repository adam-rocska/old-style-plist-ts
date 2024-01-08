import {PlistStringNode} from "@21gram-consulting/plist";
import {Expression} from "../Expression";

export class StringExpression extends Expression<PlistStringNode> {
  static readonly simple = /^[a-zA-Z0-9_$+/:.-]+$/;

  protected resolve(): PlistStringNode | void {
    return this.context.present[0] === `"`
      ? this.resolveProper()
      : this.resolveSimple();
  }

  private resolveSimple(): PlistStringNode | void {
    this.context.commitPresent();
    while (this.context.hasFuture) {
      if (StringExpression.simple.test(this.context.future[0] ?? ``)) break;
      this.context.updatePresent();
    }
    const result = PlistStringNode(this.context.present);
    this.context.commitPresent();
    return result;
  }

  private resolveProper(): PlistStringNode | void {
    this.context.commitPresent();
    let didClose = false;
    while (this.context.hasFuture) {
      this.context.updatePresent();
      if (this.context.present.endsWith(`\\"`)) continue;
      if (this.context.present.endsWith(`"`)) {
        didClose = true;
        break;
      }
    }
    if (!didClose) return this.error(`Unclosed string.`);
    const result = PlistStringNode(this.context.present);
    this.context.commitPresent();
    return result;
  }

}
