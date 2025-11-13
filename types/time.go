package types

import (
	"database/sql/driver"
	"fmt"
	"time"
)

const (
	timeFormat = "2006-01-02 15:04:05"
	locName    = "Asia/Seoul"
)

var seoul *time.Location

func init() {
	var err error
	seoul, err = time.LoadLocation(locName)
	if err != nil {
		// This will cause a panic if the timezone data is not available.
		// This is a reasonable approach for an application that depends on this timezone.
		panic(fmt.Sprintf("could not load location %s: %v", locName, err))
	}
}

// CustomTime is a wrapper around time.Time to handle custom time formatting.
type CustomTime struct {
	time.Time
}

// Scan implements the sql.Scanner interface.
func (ct *CustomTime) Scan(value interface{}) error {
	if value == nil {
		ct.Time = time.Time{}
		return nil
	}

	strVal, ok := value.(string)
	if !ok {
		return fmt.Errorf("CustomTime: unsupported type for scan: %T", value)
	}

	t, err := time.ParseInLocation(timeFormat, strVal, seoul)
	if err != nil {
		return fmt.Errorf("CustomTime: could not parse time: %w", err)
	}

	ct.Time = t
	return nil
}

// Value implements the driver.Valuer interface.
func (ct CustomTime) Value() (driver.Value, error) {
	if ct.IsZero() {
		return nil, nil
	}
	return ct.Time.In(seoul).Format(timeFormat), nil
}

// MarshalJSON implements the json.Marshaler interface.
func (ct CustomTime) MarshalJSON() ([]byte, error) {
	if ct.IsZero() {
		return []byte("null"), nil
	}
	return []byte(fmt.Sprintf(`"%s"`, ct.Time.In(seoul).Format(time.RFC3339))), nil
}

// UnmarshalJSON implements the json.Unmarshaler interface.
func (ct *CustomTime) UnmarshalJSON(data []byte) error {
	if string(data) == "null" {
		ct.Time = time.Time{}
		return nil
	}

	// The data includes quotes, so we need to remove them.
	t, err := time.Parse(`"`+time.RFC3339+`"`, string(data))
	if err != nil {
		return err
	}
	ct.Time = t
	return nil
}
