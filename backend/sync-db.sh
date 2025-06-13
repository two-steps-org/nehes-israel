#!/bin/bash

# styling variables for logs
GREEN='\033[0;32m'
CYAN='\033[0;36m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
RESET='\033[0m'

# helpers
log() {
  echo -e "${CYAN}[$(date '+%Y-%m-%d %H:%M:%S')]${RESET} $1"
}

error() {
  echo -e "${RED}[$(date '+%Y-%m-%d %H:%M:%S') ERROR]${RESET} $1"
}

success() {
  echo -e "${GREEN}[$(date '+%Y-%m-%d %H:%M:%S') SUCCESS]${RESET} $1"
}

warning() {
  echo -e "${YELLOW}[$(date '+%Y-%m-%d %H:%M:%S') WARNING]${RESET} $1"
}

# TODO: copy paste from .env file
BACKUP_DIR=""
DB=""
ATLAS_URI=""
LOCAL_MONGO_URI=""

# Start fetching data
log "----------------------------------------${NC}"
log "Starting MongoDB Atlas data fetch process...${NC}"
log "----------------------------------------${NC}"

# Create backup directory
if mkdir -p "$BACKUP_DIR"; then
    success "[✔] Backup directory created: $BACKUP_DIR${NC}"
else
    error "[✘] Failed to create backup directory: $BACKUP_DIR${NC}"
    exit 1
fi

# Execute mongodump
warning "Fetching data from database: $DB${NC}"
if mongodump --uri="$ATLAS_URI" --db="$DB" --out="$BACKUP_DIR" -v; then
    success "[✔] Data fetched successfully and stored at: $BACKUP_DIR${NC}"
else
    error "[✘] Data fetch failed. Please check your URI or database connection.${NC}"
    exit 1
fi

log "---------------------------------------${NC}"
success "MongoDB data fetch process completed successfully!${NC}"
warning "Restore database into local env (mongo)${NC}"

# Restore database
log "Restoring MongoDB data from backup..."
if mongorestore --drop --uri="$LOCAL_MONGO_URI" "$BACKUP_DIR/$DB"; then
  success "Database restoration completed successfully."
  rm -rf "$BACKUP_DIR"
  fi
else
  error "Failed to restore the database. Please check the backup file and connection."
  exit 1
fi
