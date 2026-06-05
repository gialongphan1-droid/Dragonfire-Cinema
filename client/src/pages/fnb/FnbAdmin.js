import React, { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";

const API_URL = "http://localhost:5000/api";

const emptyFormData = (type, item = null) => {
  if (type === "category") {
    return {
      categoryName: item?.categoryName || "",
      description: item?.description || "",
    };
  }

  if (type === "product") {
    return {
      categoryId: item?.categoryId?._id || item?.categoryId || "",
      productName: item?.productName || "",
      price: item?.price ?? "",
      quantity: item?.quantity ?? 0,
      size: item?.size || "",
      image: item?.image || "",
      description: item?.description || "",
      status: item?.status ?? true,
    };
  }

  if (type === "inventory") {
    return {
      quantity: item?.quantity ?? 0,
      status: item?.status ?? true,
    };
  }

  if (type === "combo") {
    return {
      comboId: item?.comboId?._id || item?.comboId || "",
      productId: item?.productId?._id || item?.productId || "",
      quantity: item?.quantity ?? 1,
    };
  }

  return {};
};

const FnbAdmin = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [combos, setCombos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("category");
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState(emptyFormData("category"));
  const [errors, setErrors] = useState({});
  const [expandedComboIds, setExpandedComboIds] = useState([]);

  const token = localStorage.getItem("token");
  const authConfig = token ? { headers: { Authorization: `Bearer ${token}` } } : {};

  const currencyFormatter = useMemo(
    () =>
      new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
      }),
    []
  );

  const categoryMap = useMemo(() => {
    return new Map(categories.map((category) => [category._id, category]));
  }, [categories]);

  const productMap = useMemo(() => {
    return new Map(products.map((product) => [product._id, product]));
  }, [products]);

  const comboItemsByComboId = useMemo(() => {
    const groupedCombos = new Map();

    combos.forEach((comboDetail) => {
      const comboKey = comboDetail.comboId?._id || comboDetail.comboId;

      if (!comboKey) {
        return;
      }

      if (!groupedCombos.has(comboKey)) {
        groupedCombos.set(comboKey, []);
      }

      groupedCombos.get(comboKey).push(comboDetail);
    });

    return groupedCombos;
  }, [combos]);

  const fetchAllData = useCallback(async () => {
    setLoading(true);

    try {
      const [categoryResult, productResult, comboResult] = await Promise.allSettled([
        axios.get(`${API_URL}/products/categories`),
        axios.get(`${API_URL}/products`),
        axios.get(`${API_URL}/products/combos`),
      ]);

      if (categoryResult.status === "fulfilled" && categoryResult.value.data.success) {
        setCategories(categoryResult.value.data.data);
      }

      if (productResult.status === "fulfilled" && productResult.value.data.success) {
        setProducts(productResult.value.data.data);
      }

      if (comboResult.status === "fulfilled" && comboResult.value.data.success) {
        setCombos(comboResult.value.data.data);
      }

      [categoryResult, productResult, comboResult].forEach((result) => {
        if (result.status === "rejected") {
          console.error(result.reason);
        }
      });
    } catch (error) {
      console.error("Không thể tải dữ liệu F&B:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  const openModal = (type, item = null) => {
    setModalType(type);
    setEditingItem(item);
    setFormData(emptyFormData(type, item));
    setErrors({});
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingItem(null);
    setErrors({});
    setFormData(emptyFormData("category"));
  };

  const validateForm = () => {
    const nextErrors = {};

    if (modalType === "category" && !formData.categoryName.trim()) {
      nextErrors.categoryName = "Tên danh mục không được để trống";
    }

    if (modalType === "product") {
      if (!formData.categoryId) {
        nextErrors.categoryId = "Vui lòng chọn danh mục";
      }

      if (!formData.productName.trim()) {
        nextErrors.productName = "Tên sản phẩm không được để trống";
      }

      if (Number(formData.price) < 0) {
        nextErrors.price = "Giá sản phẩm phải lớn hơn hoặc bằng 0";
      }
    }

    if (modalType === "inventory" && Number(formData.quantity) < 0) {
      nextErrors.quantity = "Tồn kho không được nhỏ hơn 0";
    }

    if (modalType === "combo") {
      if (!formData.comboId) {
        nextErrors.comboId = "Vui lòng chọn combo";
      }

      if (!formData.productId) {
        nextErrors.productId = "Vui lòng chọn sản phẩm thành phần";
      }

      if (formData.comboId && formData.productId && formData.comboId === formData.productId) {
        nextErrors.productId = "Combo và sản phẩm thành phần phải khác nhau";
      }

      if (Number(formData.quantity) <= 0) {
        nextErrors.quantity = "Số lượng phải lớn hơn 0";
      }
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      let response;

      if (modalType === "category") {
        const payload = {
          categoryName: formData.categoryName.trim(),
          description: formData.description.trim(),
        };

        response = editingItem
          ? await axios.put(`${API_URL}/products/categories/${editingItem._id}`, payload, authConfig)
          : await axios.post(`${API_URL}/products/categories`, payload, authConfig);
      }

      if (modalType === "product") {
        const payload = {
          categoryId: formData.categoryId,
          productName: formData.productName.trim(),
          price: Number(formData.price),
          quantity: Number(formData.quantity),
          size: formData.size.trim(),
          image: formData.image.trim(),
          description: formData.description.trim(),
          status: formData.status,
        };

        response = editingItem
          ? await axios.put(`${API_URL}/products/${editingItem._id}`, payload, authConfig)
          : await axios.post(`${API_URL}/products`, payload, authConfig);
      }

      if (modalType === "inventory") {
        const payload = {
          categoryId: editingItem.categoryId?._id || editingItem.categoryId,
          productName: editingItem.productName,
          price: editingItem.price,
          quantity: Number(formData.quantity),
          size: editingItem.size || "",
          image: editingItem.image || "",
          description: editingItem.description || "",
          status: formData.status,
        };

        response = await axios.put(`${API_URL}/products/${editingItem._id}`, payload, authConfig);
      }

      if (modalType === "combo") {
        const payload = {
          comboId: formData.comboId,
          productId: formData.productId,
          quantity: Number(formData.quantity),
        };

        response = editingItem
          ? await axios.put(`${API_URL}/products/combos/${editingItem._id}`, payload, authConfig)
          : await axios.post(`${API_URL}/products/combos`, payload, authConfig);
      }

      if (response?.data?.success) {
        alert(response.data.message);
        closeModal();
        await fetchAllData();
      }
    } catch (error) {
      alert(error.response?.data?.message || "Có lỗi xảy ra");
    }
  };

  const handleDelete = async (type, item) => {
    const confirmMessage = {
      category: "Bạn có chắc muốn xóa danh mục này?",
      product: "Bạn có chắc muốn xóa sản phẩm này?",
      combo: "Bạn có chắc muốn xóa combo này?",
    }[type];

    if (!window.confirm(confirmMessage)) {
      return;
    }

    try {
      const endpoint = {
        category: `${API_URL}/products/categories/${item._id}`,
        product: `${API_URL}/products/${item._id}`,
        combo: `${API_URL}/products/combos/${item._id}`,
      }[type];

      const response = await axios.delete(endpoint, authConfig);
      if (response.data.success) {
        alert(response.data.message);
        await fetchAllData();
      }
    } catch (error) {
      alert(error.response?.data?.message || "Có lỗi xảy ra");
    }
  };

  const formatCurrency = (value) => currencyFormatter.format(Number(value || 0));

  const getCategoryName = (item) => {
    if (!item) return "-";
    if (typeof item === "string") return categoryMap.get(item)?.categoryName || "-";
    return item.categoryName || "-";
  };

  const getProductName = (item) => {
    if (!item) return "-";
    if (typeof item === "string") return productMap.get(item)?.productName || "-";
    return item.productName || "-";
  };

  const comboGroups = useMemo(() => {
    return Array.from(comboItemsByComboId.entries()).map(([comboKey, comboItems]) => {
      const comboId = comboItems[0]?.comboId?._id || comboItems[0]?.comboId;
      const comboName = productMap.get(comboId)?.productName || "-";

      return {
        comboKey,
        comboName,
        comboItems,
        totalItems: comboItems.length,
        totalQuantity: comboItems.reduce((sum, item) => sum + Number(item.quantity || 0), 0),
      };
    });
  }, [comboItemsByComboId, productMap]);

  const isComboExpanded = (comboKey) => expandedComboIds.includes(comboKey);

  const toggleComboGroup = (comboKey) => {
    setExpandedComboIds((currentExpanded) =>
      currentExpanded.includes(comboKey)
        ? currentExpanded.filter((expandedId) => expandedId !== comboKey)
        : [...currentExpanded, comboKey]
    );
  };

  const renderComboComponents = (combo) => {
    const comboKey = combo?.comboId?._id || combo?.comboId;
    const comboItems = comboItemsByComboId.get(comboKey) || [];

    if (comboItems.length === 0) {
      return "-";
    }

    return (
      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
        {comboItems.map((comboItem) => {
          const isCurrentItem = comboItem._id === combo._id;

          return (
            <span
              key={comboItem._id}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "4px",
                padding: "4px 10px",
                borderRadius: "999px",
                background: isCurrentItem ? "rgba(59, 130, 246, 0.15)" : "rgba(15, 23, 42, 0.08)",
                color: "inherit",
                fontSize: "12px",
                lineHeight: 1.4,
                whiteSpace: "nowrap",
              }}
            >
              <strong>{getProductName(comboItem.productId)}</strong>
              <span>x {comboItem.quantity}</span>
              {isCurrentItem && <span>(đang xem)</span>}
            </span>
          );
        })}
      </div>
    );
  };

  const summaryCards = [
    { label: "Danh mục", value: categories.length },
    { label: "Sản phẩm", value: products.length },
    { label: "Tổng tồn kho", value: products.reduce((sum, product) => sum + Number(product.quantity || 0), 0) },
    { label: "Combo", value: comboGroups.length },
  ];

  const renderEmpty = (message) => <div className="admin-empty-state">{message}</div>;

  const renderDashboard = () => (
    <>
      <div className="admin-summary-grid">
        {summaryCards.map((card) => (
          <div className="admin-summary-card" key={card.label}>
            <span>{card.label}</span>
            <strong>{card.value}</strong>
          </div>
        ))}
      </div>

      <div className="admin-section">
        <div className="admin-section-header">
          <h2>Truy cập nhanh</h2>
        </div>
        <div className="admin-quick-actions">
          <button type="button" className="btn btn-primary" onClick={() => openModal("category")}>
            + Danh mục
          </button>
          <button type="button" className="btn btn-primary" onClick={() => openModal("product")}>
            + Sản phẩm
          </button>
          <button type="button" className="btn btn-primary" onClick={() => openModal("combo")}>
            + Combo
          </button>
        </div>
      </div>
    </>
  );

  const renderCategories = () => (
    <div className="admin-section">
      <div className="admin-section-header">
        <div>
          <h2>Quản lý danh mục</h2>
          <p className="admin-section-note">Dùng cho nhóm đồ ăn, đồ uống và các nhóm bán hàng khác.</p>
        </div>
        <button type="button" className="btn btn-primary" onClick={() => openModal("category")}>
          + Thêm danh mục
        </button>
      </div>

      {categories.length === 0 ? (
        renderEmpty("Chưa có danh mục nào.")
      ) : (
        <div className="admin-table admin-fnb-table">
          <table>
            <thead>
              <tr>
                <th>STT</th>
                <th>Tên danh mục</th>
                <th>Mô tả</th>
                <th>Ngày tạo</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((category, index) => (
                <tr key={category._id}>
                  <td>{index + 1}</td>
                  <td>{category.categoryName}</td>
                  <td>{category.description || "-"}</td>
                  <td>{new Date(category.createdAt).toLocaleDateString("vi-VN")}</td>
                  <td>
                    <div className="admin-table-actions">
                      <button type="button" className="btn btn-outline" onClick={() => openModal("category", category)}>
                        Sửa
                      </button>
                      <button type="button" className="btn" onClick={() => handleDelete("category", category)}>
                        Xóa
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  const renderProducts = () => (
    <div className="admin-section">
      <div className="admin-section-header">
        <div>
          <h2>Quản lý đồ ăn và đồ uống</h2>
          <p className="admin-section-note">Sản phẩm gắn với danh mục và dùng luôn cho tồn kho.</p>
        </div>
        <button type="button" className="btn btn-primary" onClick={() => openModal("product")}>
          + Thêm sản phẩm
        </button>
      </div>

      {products.length === 0 ? (
        renderEmpty("Chưa có sản phẩm nào.")
      ) : (
        <div className="admin-table admin-fnb-table">
          <table>
            <thead>
              <tr>
                <th>STT</th>
                <th>Ảnh</th>
                <th>Tên sản phẩm</th>
                <th>Danh mục</th>
                <th>Giá</th>
                <th>Tồn kho</th>
                <th>Kích thước</th>
                <th>Trạng thái</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product, index) => (
                <tr key={product._id}>
                  <td>{index + 1}</td>
                  <td>
                    <img
                      src={product.image || "https://via.placeholder.com/64x64?text=F%26B"}
                      alt={product.productName}
                      style={{ width: 56, height: 56, objectFit: "cover", borderRadius: 8 }}
                    />
                  </td>
                  <td>{product.productName}</td>
                  <td>{getCategoryName(product.categoryId)}</td>
                  <td>{formatCurrency(product.price)}</td>
                  <td>{product.quantity ?? 0}</td>
                  <td>{product.size || "-"}</td>
                  <td>
                    <span className={`admin-badge ${product.status ? "success" : "warning"}`}>
                      {product.status ? "Đang bán" : "Ngừng bán"}
                    </span>
                  </td>
                  <td>
                    <div className="admin-table-actions">
                      <button type="button" className="btn btn-outline" onClick={() => openModal("product", product)}>
                        Sửa
                      </button>
                      <button type="button" className="btn btn-outline" onClick={() => openModal("inventory", product)}>
                        Tồn kho
                      </button>
                      <button type="button" className="btn" onClick={() => handleDelete("product", product)}>
                        Xóa
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  const renderInventory = () => (
    <div className="admin-section">
      <div className="admin-section-header">
        <div>
          <h2>Quản lý tồn kho</h2>
          <p className="admin-section-note">Điều chỉnh số lượng bán ra và trạng thái hàng hóa.</p>
        </div>
      </div>

      {products.length === 0 ? (
        renderEmpty("Chưa có dữ liệu tồn kho.")
      ) : (
        <div className="admin-table admin-fnb-table">
          <table>
            <thead>
              <tr>
                <th>STT</th>
                <th>Sản phẩm</th>
                <th>Danh mục</th>
                <th>Tồn hiện tại</th>
                <th>Trạng thái</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product, index) => (
                <tr key={product._id}>
                  <td>{index + 1}</td>
                  <td>{product.productName}</td>
                  <td>{getCategoryName(product.categoryId)}</td>
                  <td>{product.quantity ?? 0}</td>
                  <td>
                    <span className={`admin-badge ${product.status ? "success" : "danger"}`}>
                      {product.status ? "Còn bán" : "Tạm ẩn"}
                    </span>
                  </td>
                  <td>
                    <div className="admin-table-actions">
                      <button type="button" className="btn btn-outline" onClick={() => openModal("inventory", product)}>
                        Điều chỉnh
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  const renderGroupedCombos = () => (
    <div className="admin-section">
      <div className="admin-section-header">
        <div>
          <h2>Quản lý combo</h2>
          <p className="admin-section-note">
            Mỗi combo được gom thành một nhóm. Bạn có thể bung ra để xem từng món thành phần.
          </p>
        </div>
        <button type="button" className="btn btn-primary" onClick={() => openModal("combo")}>
          + Thêm combo
        </button>
      </div>

      {comboGroups.length === 0 ? (
        renderEmpty("Chưa có combo nào.")
      ) : (
        <div className="admin-table admin-fnb-table">
          <table>
            <thead>
              <tr>
                <th>STT</th>
                <th>Combo</th>
                <th>Số món</th>
                <th>Tổng số lượng</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {comboGroups.map((group, index) => {
                const expanded = isComboExpanded(group.comboKey);

                return (
                  <React.Fragment key={group.comboKey}>
                    <tr>
                      <td>{index + 1}</td>
                      <td>{group.comboName}</td>
                      <td>{group.totalItems}</td>
                      <td>{group.totalQuantity}</td>
                      <td>
                        <div className="admin-table-actions">
                          <button
                            type="button"
                            className="btn btn-outline"
                            onClick={() => toggleComboGroup(group.comboKey)}
                          >
                            {expanded ? "Thu gọn" : "Bung chi tiết"}
                          </button>
                        </div>
                      </td>
                    </tr>

                    {expanded && (
                      <tr>
                        <td colSpan="5">
                          <div style={{ padding: "12px 4px" }}>
                            <table>
                              <thead>
                                <tr>
                                  <th>STT</th>
                                  <th>Sản phẩm thành phần</th>
                                  <th>Số lượng</th>
                                  <th>Hành động</th>
                                </tr>
                              </thead>
                              <tbody>
                                {group.comboItems.map((comboItem, detailIndex) => (
                                  <tr key={comboItem._id}>
                                    <td>{detailIndex + 1}</td>
                                    <td>{getProductName(comboItem.productId)}</td>
                                    <td>{comboItem.quantity}</td>
                                    <td>
                                      <div className="admin-table-actions">
                                        <button
                                          type="button"
                                          className="btn btn-outline"
                                          onClick={() => openModal("combo", comboItem)}
                                        >
                                          Sửa
                                        </button>
                                        <button type="button" className="btn" onClick={() => handleDelete("combo", comboItem)}>
                                          Xóa
                                        </button>
                                      </div>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  const renderCombos = () => (
    <div className="admin-section">
      <div className="admin-section-header">
        <div>
          <h2>Quản lý combo</h2>
          <p className="admin-section-note">
            Mỗi dòng là một thành phần của combo. Cột bên cạnh sẽ liệt kê toàn bộ món có trong cùng combo để dễ kiểm tra.
          </p>
        </div>
        <button type="button" className="btn btn-primary" onClick={() => openModal("combo")}>
          + Thêm combo
        </button>
      </div>

      {combos.length === 0 ? (
        renderEmpty("Chưa có combo nào.")
      ) : (
        <div className="admin-table admin-fnb-table">
          <table>
            <thead>
              <tr>
                <th>STT</th>
                <th>Combo</th>
                <th>Sản phẩm thành phần</th>
                <th>Chi tiết combo</th>
                <th>Số lượng</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {combos.map((combo, index) => (
                <tr key={combo._id}>
                  <td>{index + 1}</td>
                  <td>{getProductName(combo.comboId)}</td>
                  <td>{getProductName(combo.productId)}</td>
                  <td>{renderComboComponents(combo)}</td>
                  <td>{combo.quantity}</td>
                  <td>
                    <div className="admin-table-actions">
                      <button type="button" className="btn btn-outline" onClick={() => openModal("combo", combo)}>
                        Sửa
                      </button>
                      <button type="button" className="btn" onClick={() => handleDelete("combo", combo)}>
                        Xóa
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  const renderSection = () => {
    if (activeTab === "dashboard") return renderDashboard();
    if (activeTab === "categories") return renderCategories();
    if (activeTab === "products") return renderProducts();
    if (activeTab === "inventory") return renderInventory();
    return renderGroupedCombos();
  };

  const renderModalBody = () => {
    if (modalType === "category") {
      return (
        <>
          <div className="form-group">
            <label>Tên danh mục</label>
            <input
              type="text"
              className={`form-control ${errors.categoryName ? "error" : ""}`}
              value={formData.categoryName}
              onChange={(event) => setFormData({ ...formData, categoryName: event.target.value })}
              placeholder="Ví dụ: Nước ngọt, Bắp rang, Combo"
            />
            {errors.categoryName && <span className="error-text">{errors.categoryName}</span>}
          </div>

          <div className="form-group">
            <label>Mô tả</label>
            <textarea
              className="form-control"
              rows="3"
              value={formData.description}
              onChange={(event) => setFormData({ ...formData, description: event.target.value })}
            />
          </div>
        </>
      );
    }

    if (modalType === "product") {
      return (
        <>
          <div className="form-group">
            <label>Danh mục</label>
            <select
              className={`form-control ${errors.categoryId ? "error" : ""}`}
              value={formData.categoryId}
              onChange={(event) => setFormData({ ...formData, categoryId: event.target.value })}
            >
              <option value="">-- Chọn danh mục --</option>
              {categories.map((category) => (
                <option key={category._id} value={category._id}>
                  {category.categoryName}
                </option>
              ))}
            </select>
            {errors.categoryId && <span className="error-text">{errors.categoryId}</span>}
          </div>

          <div className="form-group">
            <label>Tên sản phẩm</label>
            <input
              type="text"
              className={`form-control ${errors.productName ? "error" : ""}`}
              value={formData.productName}
              onChange={(event) => setFormData({ ...formData, productName: event.target.value })}
              placeholder="Ví dụ: Coca Cola, Bắp phô mai"
            />
            {errors.productName && <span className="error-text">{errors.productName}</span>}
          </div>

          <div className="form-group">
            <label>Giá bán</label>
            <input
              type="number"
              className={`form-control ${errors.price ? "error" : ""}`}
              value={formData.price}
              onChange={(event) => setFormData({ ...formData, price: event.target.value })}
              min="0"
              step="1000"
            />
            {errors.price && <span className="error-text">{errors.price}</span>}
          </div>

          <div className="form-group">
            <label>Tồn kho</label>
            <input
              type="number"
              className="form-control"
              value={formData.quantity}
              onChange={(event) => setFormData({ ...formData, quantity: event.target.value })}
              min="0"
              step="1"
            />
          </div>

          <div className="form-group">
            <label>Kích thước / size</label>
            <input
              type="text"
              className="form-control"
              value={formData.size}
              onChange={(event) => setFormData({ ...formData, size: event.target.value })}
              placeholder="Ví dụ: M, L, 500ml"
            />
          </div>

          <div className="form-group">
            <label>Ảnh sản phẩm</label>
            <input
              type="text"
              className="form-control"
              value={formData.image}
              onChange={(event) => setFormData({ ...formData, image: event.target.value })}
              placeholder="https://..."
            />
          </div>

          <div className="form-group">
            <label>Mô tả</label>
            <textarea
              className="form-control"
              rows="3"
              value={formData.description}
              onChange={(event) => setFormData({ ...formData, description: event.target.value })}
            />
          </div>

          <div className="form-group">
            <label>Trạng thái</label>
            <select
              className="form-control"
              value={String(formData.status)}
              onChange={(event) =>
                setFormData({ ...formData, status: event.target.value === "true" })
              }
            >
              <option value="true">Đang bán</option>
              <option value="false">Tạm ngừng</option>
            </select>
          </div>
        </>
      );
    }

    if (modalType === "inventory") {
      return (
        <>
          <div className="form-group">
            <label>Sản phẩm</label>
            <div className="admin-readonly">{editingItem?.productName}</div>
          </div>

          <div className="form-group">
            <label>Danh mục</label>
            <div className="admin-readonly">{getCategoryName(editingItem?.categoryId)}</div>
          </div>

          <div className="form-group">
            <label>Số lượng tồn</label>
            <input
              type="number"
              className={`form-control ${errors.quantity ? "error" : ""}`}
              value={formData.quantity}
              onChange={(event) => setFormData({ ...formData, quantity: event.target.value })}
              min="0"
              step="1"
            />
            {errors.quantity && <span className="error-text">{errors.quantity}</span>}
          </div>

          <div className="form-group">
            <label>Trạng thái</label>
            <select
              className="form-control"
              value={String(formData.status)}
              onChange={(event) =>
                setFormData({ ...formData, status: event.target.value === "true" })
              }
            >
              <option value="true">Còn bán</option>
              <option value="false">Tạm ẩn</option>
            </select>
          </div>
        </>
      );
    }

    return (
      <>
        <div className="form-group">
          <label>Combo</label>
          <select
            className={`form-control ${errors.comboId ? "error" : ""}`}
            value={formData.comboId}
            onChange={(event) => setFormData({ ...formData, comboId: event.target.value })}
          >
            <option value="">-- Chọn combo --</option>
            {products.map((product) => (
              <option key={product._id} value={product._id}>
                {product.productName}
              </option>
            ))}
          </select>
          {errors.comboId && <span className="error-text">{errors.comboId}</span>}
        </div>

        <div className="form-group">
          <label>Sản phẩm thành phần</label>
          <select
            className={`form-control ${errors.productId ? "error" : ""}`}
            value={formData.productId}
            onChange={(event) => setFormData({ ...formData, productId: event.target.value })}
          >
            <option value="">-- Chọn sản phẩm --</option>
            {products.map((product) => (
              <option key={product._id} value={product._id}>
                {product.productName}
              </option>
            ))}
          </select>
          {errors.productId && <span className="error-text">{errors.productId}</span>}
        </div>

        <div className="form-group">
          <label>Số lượng</label>
          <input
            type="number"
            className={`form-control ${errors.quantity ? "error" : ""}`}
            value={formData.quantity}
            onChange={(event) => setFormData({ ...formData, quantity: event.target.value })}
            min="1"
            step="1"
          />
          {errors.quantity && <span className="error-text">{errors.quantity}</span>}
        </div>
      </>
    );
  };

  if (loading) {
    return <div className="loading text-center mt-5">Đang tải dữ liệu F&amp;B...</div>;
  }

  return (
    <div className="admin-fnb-container">
      <div className="admin-header">
        <div>
          <h1>Quản lý F&amp;B</h1>
          <p className="admin-section-note">
            Quản lý danh mục, đồ ăn đồ uống, tồn kho và combo từ dữ liệu backend hiện có.
          </p>
        </div>
      </div>

      <div className="admin-fnb-tabs">
        <button
          type="button"
          className={`admin-fnb-tab ${activeTab === "dashboard" ? "active" : ""}`}
          onClick={() => setActiveTab("dashboard")}
        >
          Tổng quan
        </button>
        <button
          type="button"
          className={`admin-fnb-tab ${activeTab === "categories" ? "active" : ""}`}
          onClick={() => setActiveTab("categories")}
        >
          Danh mục
        </button>
        <button
          type="button"
          className={`admin-fnb-tab ${activeTab === "products" ? "active" : ""}`}
          onClick={() => setActiveTab("products")}
        >
          Đồ ăn &amp; đồ uống
        </button>
        <button
          type="button"
          className={`admin-fnb-tab ${activeTab === "inventory" ? "active" : ""}`}
          onClick={() => setActiveTab("inventory")}
        >
          Tồn kho
        </button>
        <button
          type="button"
          className={`admin-fnb-tab ${activeTab === "combos" ? "active" : ""}`}
          onClick={() => setActiveTab("combos")}
        >
          Combo
        </button>
      </div>

      {renderSection()}

      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content modal-content--wide" onClick={(event) => event.stopPropagation()}>
            <h2>
              {modalType === "category" && (editingItem ? "Sửa danh mục" : "Thêm danh mục")}
              {modalType === "product" && (editingItem ? "Sửa sản phẩm" : "Thêm sản phẩm")}
              {modalType === "inventory" && "Điều chỉnh tồn kho"}
              {modalType === "combo" && (editingItem ? "Sửa combo" : "Thêm combo")}
            </h2>

            <form onSubmit={handleSubmit}>
              {renderModalBody()}

              <div className="modal-actions">
                <button type="button" className="btn btn-outline" onClick={closeModal}>
                  Hủy
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingItem ? "Cập nhật" : "Thêm mới"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FnbAdmin;
