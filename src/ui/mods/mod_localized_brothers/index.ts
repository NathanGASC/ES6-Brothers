class LocalizedBrothers {
  sqHandle: any = null
  static id = "localized_brothers";

  onConnection(sqHandle: any) {
    this.sqHandle = sqHandle;
  }
}

(window as any).registerScreen(LocalizedBrothers.id, new LocalizedBrothers());