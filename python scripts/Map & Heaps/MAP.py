class MapBase:
    class _item:
        __slots__ = ("_key", "_value")

        def __init__(self, k, v):
            self._key = k
            self._value = v


class myMap(MapBase):
    def __init__(self):
        self._table = []  # list of items

    def __getitem__(self, k):
        for item in self._table:
            if k == item._key:
                return item._value
        raise KeyError("Key error: " + repr(k))

    def __setitem__(self, key, value):
        for item in self._table:
            if key == item._key:
                item._value = value
                return
        self._table.append(self._item(key, value))

    def __delitem__(self, key):
        for j in range(len(self._table)):
            if key == self._table[j]._key:
                self._table.pop(j)
                return
        raise KeyError("Key error: " + repr(key))

    def __len__(self):
        return len(self._table)


if __name__ == "__main__":
    data = myMap()
    data["name"] = "Khaya"
    data["age"] = 21
    data["city"] = "Durban"
    data["country"] = "South Africa"
    data["email"] = "Khayaneoncm007@Gmail.com"
    data["is_student"] = True

    print(data["name"])
    print(data["age"])
    print(data["city"])
    print(data["country"])
    print(data["email"])
    print(data["is_student"])

    print(data.__len__())
    print(data.__getitem__("name"))
    print(data.__setitem__("name","KAI"))
