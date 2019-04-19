workflow "CI" {
  on = "push"
  resolves = ["Lint", "Test"]
}

action "Install" {
  uses = "docker://node:11-alpine"
  runs = "yarn"
}

action "Lint" {
  uses = "docker://node:11-alpine"
  needs = ["Install"]
  runs = "yarn"
  args = "lint"
}

action "Test" {
  uses = "docker://node:11-alpine"
  needs = ["Install"]
  runs = "yarn"
  args = "test --webdriver.hostname hub-cloud.browserstack.com"
  secrets = ["BROWSERSTACK_ACCESS_KEY"]
}
