import debounce from 'debounce-promise'

export class ContextAwareDebounce<Context, DebouncedFunction extends (...args: any[]) => any> {
  private readonly _map: Map<Context, DebouncedFunction> = new Map()

  private readonly _debounceCreator: () => DebouncedFunction

  constructor(
    readonly debouncedFunction: DebouncedFunction,
    readonly wait: number
  ) {
    this._debounceCreator = () => debounce(debouncedFunction, wait) as any
  }

  call(context: Context, ...args: Parameters<DebouncedFunction>): ReturnType<DebouncedFunction> {
    if (!this._map.has(context)) {
      this._map.set(context, this._debounceCreator())
    }

    return this._map.get(context)!(...args)
  }

  /**
   * Call but do not await the return value. Can result in an unhandled rejection. Make sure to try catch in your debounced function!
   */
  callFloating(context: Context, ...args: Parameters<DebouncedFunction>): void {
    // eslint doesnt find this but it should be disabled: @typescript-eslint/no-floating-promises
    this.call(context, ...args)
  }
}
