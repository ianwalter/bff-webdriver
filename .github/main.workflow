workflow "CI" {
  on = "push"
  resolves = ["Lint", "Test"]
}

action "Install" {
  uses = "ianwalter/bsl@v2.0.1"
  runs = "yarn"
}

action "Lint" {
  uses = "ianwalter/bsl@v2.0.1"
  needs = ["Install"]
  runs = "yarn"
  args = "lint"
}

action "Test" {
  uses = "ianwalter/bsl@v2.0.1"
  needs = ["Install"]
  args = "yarn test"
  secrets = [
    "BROWSERSTACK_USERNAME",
    "BROWSERSTACK_ACCESS_KEY",
  ]
}
