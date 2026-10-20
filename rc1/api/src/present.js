function activityFrom(row) {
  return {
    id: row.activity_id || row.id,
    title: row.activity_title || row.title,
    summary: row.activity_summary || row.summary,
    campus: row.campus,
    place: row.place,
    startsAt: new Date(row.starts_at).toISOString(),
    capacity: row.capacity,
    taken: row.taken,
    coordinatorLabel: row.coordinator_label
  };
}

export function toActivity(row) {
  return activityFrom(row);
}

export function toRegistrationListItem(row) {
  return {
    id: row.id,
    status: row.status,
    createdAt: new Date(row.created_at).toISOString(),
    student: {
      id: row.student_id,
      displayName: row.student_name
    },
    activity: {
      id: row.activity_id,
      title: row.activity_title,
      campus: row.campus,
      place: row.place,
      startsAt: new Date(row.starts_at).toISOString()
    }
  };
}

export function toRegistrationDetail(row) {
  return {
    id: row.id,
    status: row.status,
    createdAt: new Date(row.created_at).toISOString(),
    student: {
      id: row.student_id,
      displayName: row.student_name,
      email: row.student_email
    },
    activity: {
      id: row.activity_id,
      title: row.activity_title,
      summary: row.activity_summary,
      campus: row.campus,
      place: row.place,
      startsAt: new Date(row.starts_at).toISOString(),
      coordinatorLabel: row.coordinator_label
    },
    confirmation: 'Se registró un mensaje en el correo simulado de este equipo.'
  };
}
