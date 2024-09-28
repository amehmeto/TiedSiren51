echo "Running 'yarn check:uncommitted'..."

if yarn check:uncommitted; then
  true
else
  printf "\033[0;35mError while running 'yarn check:uncommitted'. Make sure you committed all the changes or git stashed them\n\033[0m\n"
  exit 1
fi
