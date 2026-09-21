#!/usr/bin/env bash
# UserPromptSubmit hook: when the prompt reads like a correction, remind the agent
# to run the skill-forge skill once the immediate fix is done.
#
# ponytail: a regex, not a classifier. A false negative costs one lost lesson, and
# the user can always type /skill-forge. Swap in something smarter only if the
# misses turn out to matter.

jq -r '.prompt // empty' 2>/dev/null | grep -qiE \
  "^[[:space:]]*(no|nope|wrong|not (that|what))\b|you (forgot|missed|broke|ignored|didn'?t)|i (told|said|asked) you|(don'?t|stop) doing (that|this)|that'?s not (what|how)|why did you" \
  && echo "That prompt reads like a correction. Fix the problem first, then invoke the skill-forge skill and propose where the lesson should be written."

# Load-bearing: `grep -q && echo` exits 1 when the pattern does not match, which the
# harness reads as a failing hook.
exit 0
